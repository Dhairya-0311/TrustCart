import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { getRedisClient } from '../config/redis';
import { getAnalysisQueue } from '../config/queue';

const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: System health check
 *     responses:
 *       200:
 *         description: Health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 db: { type: string }
 *                 redis: { type: string }
 *                 queue: { type: string }
 *                 uptime: { type: number }
 */
router.get('/', async (_req: Request, res: Response) => {
  const health: any = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: 'disconnected',
    redis: 'disconnected',
    queue: 'unknown',
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.db = 'connected';
  } catch {
    health.db = 'disconnected';
    health.status = 'degraded';
  }

  // Check Redis
  try {
    const redis = getRedisClient();
    await redis.ping();
    health.redis = 'connected';
  } catch {
    health.redis = 'disconnected';
    health.status = 'degraded';
  }

  // Check queue
  try {
    const queue = getAnalysisQueue();
    const waiting = await queue.getWaitingCount();
    const active = await queue.getActiveCount();
    health.queue = `active: ${active}, waiting: ${waiting}`;
  } catch {
    health.queue = 'unavailable';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json({
    success: true,
    data: health,
  });
});

export default router;
