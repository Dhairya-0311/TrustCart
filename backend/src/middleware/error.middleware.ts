import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// ─── Base Error Class ────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Specific Error Classes ──────────

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class ScrapingError extends AppError {
  constructor(message: string = 'Failed to scrape product page') {
    super(message, 422, 'SCRAPING_ERROR');
  }
}

export class AIError extends AppError {
  constructor(message: string = 'AI service unavailable') {
    super(message, 502, 'AI_ERROR');
  }
}

// ─── Global Error Handler Middleware ─

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default values
  let statusCode = 500;
  let message = 'An unexpected error occurred';
  let code = 'INTERNAL_ERROR';
  let details: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    details = err.details;
  }

  // Log 5xx errors with full stack trace
  if (statusCode >= 500) {
    logger.error(`[${code}] ${message}`, {
      stack: err.stack,
      statusCode,
    });
  } else {
    logger.warn(`[${code}] ${message}`, { statusCode });
  }

  // Build response
  const response: any = {
    success: false,
    error: message,
    code,
  };

  // Include details in non-production
  if (details) {
    response.details = details;
  }

  // Include stack trace only in development
  if (env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

// ─── 404 Handler ─────────────────────

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}
