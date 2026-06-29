import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../middleware/error.middleware';

/**
 * POST /api/v1/alerts — Create a price drop alert
 */
export async function createAlert(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { product_url, platform, target_price } = req.body;

    const alert = await prisma.priceAlert.create({
      data: {
        user_id: req.user!.id,
        product_url,
        platform,
        target_price,
      },
    });

    res.status(201).json({
      success: true,
      data: { alert },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/alerts — List user's alerts
 */
export async function listAlerts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { user_id: req.user!.id },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { alerts },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/alerts/:id — Delete an alert
 */
export async function deleteAlert(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const alert = await prisma.priceAlert.findUnique({
      where: { id: req.params.id as string },
    });

    if (!alert) {
      throw new NotFoundError('Alert not found');
    }

    if (alert.user_id !== req.user!.id) {
      throw new ForbiddenError('Access denied');
    }

    await prisma.priceAlert.delete({
      where: { id: req.params.id as string },
    });

    res.status(200).json({
      success: true,
      data: { message: 'Alert deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
}
