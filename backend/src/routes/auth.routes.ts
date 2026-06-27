import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { authRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// ─── Validation Schemas ──────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8).optional(),
});

// ─── Routes ──────────────────────────

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201: { description: Account created }
 *       400: { description: Validation error }
 */
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and invalidate token
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Not authenticated }
 */
router.get('/me', authMiddleware, authController.getProfile);

/**
 * @swagger
 * /api/v1/auth/me:
 *   patch:
 *     tags: [Auth]
 *     summary: Update current user profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Profile updated }
 */
router.patch(
  '/me',
  authMiddleware,
  validate(updateProfileSchema),
  authController.updateProfile
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh JWT token
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: New token issued }
 */
router.post('/refresh', authMiddleware, authController.refreshToken);

export default router;
