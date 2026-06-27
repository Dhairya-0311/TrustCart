import { Router } from 'express';
import { z } from 'zod';
import * as analysisController from '../controllers/analysis.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { analysisRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// All analysis routes require authentication
router.use(authMiddleware);

// ─── Validation Schemas ──────────────

const createAnalysisSchema = z.object({
  url: z.string().url('Please provide a valid URL'),
});

/**
 * @swagger
 * /api/v1/analyses:
 *   post:
 *     tags: [Analyses]
 *     summary: Submit a product URL for analysis
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url: { type: string, format: uri }
 *     responses:
 *       201: { description: Analysis queued }
 *       400: { description: Invalid URL }
 */
router.post(
  '/',
  analysisRateLimiter,
  validate(createAnalysisSchema),
  analysisController.createAnalysis
);

/**
 * @swagger
 * /api/v1/analyses:
 *   get:
 *     tags: [Analyses]
 *     summary: List user's analyses
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, PROCESSING, COMPLETED, FAILED] }
 *     responses:
 *       200: { description: Paginated list of analyses }
 */
router.get('/', analysisController.listAnalyses);

/**
 * @swagger
 * /api/v1/analyses/{id}:
 *   get:
 *     tags: [Analyses]
 *     summary: Get full analysis report
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Full analysis report }
 *       404: { description: Not found }
 */
router.get('/:id', analysisController.getAnalysis);

/**
 * @swagger
 * /api/v1/analyses/{id}/status:
 *   get:
 *     tags: [Analyses]
 *     summary: Get analysis job status and progress
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Status with progress percentage }
 */
router.get('/:id/status', analysisController.getAnalysisStatus);

/**
 * @swagger
 * /api/v1/analyses/{id}:
 *   delete:
 *     tags: [Analyses]
 *     summary: Delete an analysis
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', analysisController.deleteAnalysis);

/**
 * @swagger
 * /api/v1/analyses/{id}/reviews:
 *   get:
 *     tags: [Analyses]
 *     summary: Get review breakdown for an analysis
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id/reviews', analysisController.getReviewBreakdown);

/**
 * @swagger
 * /api/v1/analyses/{id}/prices:
 *   get:
 *     tags: [Analyses]
 *     summary: Get price comparison data
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id/prices', analysisController.getPriceComparisons);

export default router;
