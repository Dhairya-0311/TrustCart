import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { getRedisClient } from '../config/redis';
import { env } from '../config/env';
import { AuthError, ValidationError, NotFoundError } from '../middleware/error.middleware';
import { JwtPayload } from '../types';

const SALT_ROUNDS = 12;

/**
 * Generates a JWT token for a user
 */
function generateToken(user: { id: string; email: string; plan: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan } as JwtPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
}

/**
 * Sanitizes user object for API response (removes password_hash)
 */
function sanitizeUser(user: any) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

/**
 * Register a new user
 */
export async function register(data: {
  email: string;
  password: string;
  name?: string;
}) {
  // Check for existing user
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new ValidationError('An account with this email already exists.');
  }

  // Validate password strength
  if (data.password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long.');
  }

  // Hash password
  const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      password_hash,
      name: data.name?.trim() || null,
    },
  });

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

/**
 * Login with email and password
 */
export async function login(data: { email: string; password: string }) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (!user) {
    throw new AuthError('Invalid email or password.');
  }

  // Verify password
  const isValid = await bcrypt.compare(data.password, user.password_hash);
  if (!isValid) {
    throw new AuthError('Invalid email or password.');
  }

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

/**
 * Logout — blacklist the token in Redis
 */
export async function logout(token: string) {
  try {
    // Decode token to get expiry
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        const redis = getRedisClient();
        await redis.setex(`auth:blacklist:${token}`, ttl, '1');
      }
    }
  } catch {
    // Silently handle — token might already be expired
  }

  return { message: 'Logged out successfully.' };
}

/**
 * Get current user profile
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          analyses: true,
          alerts: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  return sanitizeUser(user);
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: { name?: string; password?: string }
) {
  const updateData: any = {};

  if (data.name !== undefined) {
    updateData.name = data.name.trim();
  }

  if (data.password) {
    if (data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long.');
    }
    updateData.password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return sanitizeUser(user);
}

/**
 * Refresh JWT token
 */
export async function refreshToken(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const token = generateToken(user);
  return { token };
}
