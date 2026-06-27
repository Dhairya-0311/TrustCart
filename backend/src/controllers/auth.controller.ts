import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as authService from '../services/auth.service';
import { env } from '../config/env';

/**
 * POST /api/v1/auth/register
 */
export async function register(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register({ email, password, name });

    // Set httpOnly cookie
    res.cookie('__auth', result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function login(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    // Set httpOnly cookie
    res.cookie('__auth', result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 */
export async function logout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.__auth;

    const result = await authService.logout(token || '');

    // Clear cookie
    res.clearCookie('__auth');

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/me
 */
export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await authService.getProfile(req.user!.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/auth/me
 */
export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await authService.updateProfile(req.user!.id, req.body);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.refreshToken(req.user!.id);

    // Update cookie
    res.cookie('__auth', result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
