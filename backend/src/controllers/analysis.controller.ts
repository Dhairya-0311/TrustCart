import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as analysisService from '../services/analysis.service';

/**
 * POST /api/v1/analyses — Submit URL for analysis
 */
export async function createAnalysis(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { url } = req.body;
    const result = await analysisService.createAnalysis(req.user!.id, url);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analyses — List user's analyses
 */
export async function listAnalyses(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const status = req.query.status as string | undefined;

    const result = await analysisService.listAnalyses(req.user!.id, {
      page,
      limit,
      status,
    });

    res.status(200).json({
      success: true,
      data: result.analyses,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analyses/:id — Get full analysis report
 */
export async function getAnalysis(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const analysis = await analysisService.getAnalysis(
      req.params.id,
      req.user!.id
    );

    res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analyses/:id/status — Get analysis status
 */
export async function getAnalysisStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const status = await analysisService.getAnalysisStatus(
      req.params.id,
      req.user!.id
    );

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/analyses/:id — Delete analysis
 */
export async function deleteAnalysis(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await analysisService.deleteAnalysis(
      req.params.id,
      req.user!.id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analyses/:id/reviews — Get review breakdown
 */
export async function getReviewBreakdown(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await analysisService.getReviewBreakdown(
      req.params.id,
      req.user!.id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analyses/:id/prices — Get price comparisons
 */
export async function getPriceComparisons(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await analysisService.getPriceComparisons(
      req.params.id,
      req.user!.id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
