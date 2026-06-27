import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getRedisClient } from '../config/redis';
import { AuthError } from './error.middleware';
import { AuthenticatedRequest, JwtPayload } from '../types';

/**
 * Authentication middleware.
 * Reads JWT from Authorization header (Bearer) or __auth cookie.
 * Checks Redis blacklist for invalidated tokens.
 * Attaches user payload to req.user.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extract token from header or cookie
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.__auth) {
      token = req.cookies.__auth;
    }

    if (!token) {
      throw new AuthError('Authentication required. Please log in.');
    }

    // 2. Check Redis blacklist
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`auth:blacklist:${token}`);
    if (isBlacklisted) {
      throw new AuthError('Token has been invalidated. Please log in again.');
    }

    // 3. Verify JWT
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // 4. Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      plan: decoded.plan,
    };

    next();
  } catch (error) {
    if (error instanceof AuthError) {
      next(error);
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthError('Token expired. Please log in again.'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthError('Invalid token. Please log in again.'));
    } else {
      next(new AuthError('Authentication failed.'));
    }
  }
}

/**
 * Optional auth middleware — does not throw if token is missing,
 * but still validates if one is present.
 */
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.__auth) {
      token = req.cookies.__auth;
    }

    if (token) {
      const redis = getRedisClient();
      const isBlacklisted = await redis.get(`auth:blacklist:${token}`);
      if (!isBlacklisted) {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = {
          id: decoded.id,
          email: decoded.email,
          plan: decoded.plan,
        };
      }
    }

    next();
  } catch {
    // Silently continue without auth
    next();
  }
}
