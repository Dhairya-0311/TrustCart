import { Router } from 'express';
import { z } from 'zod';
import * as alertController from '../controllers/alert.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// All alert routes require authentication
router.use(authMiddleware);

// ─── Validation Schemas ──────────────

const createAlertSchema = z.object({
  product_url: z.string().url('Please provide a valid URL'),
  platform: z.string().min(1),
  target_price: z.number().positive('Target price must be positive'),
});

/**
 * @swagger
 * /api/v1/alerts:
 *   post:
 *     tags: [Alerts]
 *     summary: Create a price drop alert
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_url, platform, target_price]
 *             properties:
 *               product_url: { type: string, format: uri }
 *               platform: { type: string }
 *               target_price: { type: number }
 *     responses:
 *       201: { description: Alert created }
 */
router.post('/', validate(createAlertSchema), alertController.createAlert);

/**
 * @swagger
 * /api/v1/alerts:
 *   get:
 *     tags: [Alerts]
 *     summary: List user's price alerts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of alerts }
 */
router.get('/', alertController.listAlerts);

/**
 * @swagger
 * /api/v1/alerts/{id}:
 *   delete:
 *     tags: [Alerts]
 *     summary: Delete a price alert
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', alertController.deleteAlert);

export default router;
