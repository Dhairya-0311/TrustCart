import { prisma } from '../config/database';
import { getRedisClient } from '../config/redis';
import { detectPlatform } from '../utils/platformDetector';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/error.middleware';
import { AnalysisJobData, PaginationMeta } from '../types';

/**
 * Create a new analysis and enqueue it for processing
 */
export async function createAnalysis(userId: string, url: string) {
  // Detect platform
  const detection = detectPlatform(url);
  if (!detection.isValid) {
    throw new ValidationError(detection.error || 'Unsupported URL');
  }

  // Check for duplicate recent analysis (within last hour)
  const redis = getRedisClient();
  const cacheKey = `analysis:recent:${userId}:${Buffer.from(url).toString('base64').slice(0, 50)}`;
  const recentAnalysisId = await redis.get(cacheKey);

  if (recentAnalysisId) {
    const existing = await prisma.analysis.findUnique({
      where: { id: recentAnalysisId },
    });
    if (
      existing &&
      ['PENDING', 'PROCESSING', 'COMPLETED'].includes(existing.status) &&
      existing.product_name !== 'Unknown Product' // Force re-analysis for failed scrapes
    ) {
      return {
        analysis_id: existing.id,
        job_id: existing.job_id,
        status: existing.status,
        cached: true,
      };
    }
  }

  // Create analysis record
  const analysis = await prisma.analysis.create({
    data: {
      user_id: userId,
      url,
      platform: detection.platform as any,
      status: 'PENDING',
    },
  });

  // Enqueue BullMQ job
  const queue = getAnalysisQueue();
  const job = await queue.add(
    'analyze-product',
    {
      url,
      analysisId: analysis.id,
      userId,
    } as AnalysisJobData,
    {
      jobId: `analysis-${analysis.id}`,
      priority: 1,
    }
  );

  // Update analysis with job ID
  await prisma.analysis.update({
    where: { id: analysis.id },
    data: { job_id: job.id },
  });

  // Cache to prevent duplicates
  await redis.setex(cacheKey, 3600, analysis.id);

  // Set initial progress
  await redis.setex(`analysis:progress:${job.id}`, 3600, '0');

  return {
    analysis_id: analysis.id,
    job_id: job.id,
    status: 'PENDING',
    cached: false,
  };
}

/**
 * Get analysis status and progress
 */
export async function getAnalysisStatus(analysisId: string, userId: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
  });

  if (!analysis) {
    throw new NotFoundError('Analysis not found');
  }

  if (analysis.user_id !== userId) {
    throw new ForbiddenError('Access denied');
  }

  // Get live progress from Redis
  let progress_pct = 0;
  if (analysis.job_id && ['PENDING', 'PROCESSING'].includes(analysis.status)) {
    const redis = getRedisClient();
    const cached = await redis.get(`analysis:progress:${analysis.job_id}`);
    progress_pct = cached ? parseInt(cached, 10) : 0;
  } else if (analysis.status === 'COMPLETED') {
    progress_pct = 100;
  }

  // Step label
  let step = '';
  if (progress_pct < 10) step = 'Starting analysis...';
  else if (progress_pct < 30) step = 'Scraping product page...';
  else if (progress_pct < 55) step = 'Analyzing reviews...';
  else if (progress_pct < 70) step = 'Checking seller reputation...';
  else if (progress_pct < 85) step = 'Comparing prices...';
  else if (progress_pct < 100) step = 'Generating verdict...';
  else step = 'Analysis complete';

  return {
    id: analysis.id,
    status: analysis.status,
    progress_pct,
    step,
    error_message: analysis.error_message,
  };
}

/**
 * Get full analysis report
 */
export async function getAnalysis(analysisId: string, userId: string) {
  // Check Redis cache first
  const redis = getRedisClient();
  const cacheKey = `analysis:result:${analysisId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed.user_id === userId) {
      return parsed;
    }
  }

  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      reviews: true,
      price_comparisons: {
        orderBy: { price: 'asc' },
      },
    },
  });

  if (!analysis) {
    throw new NotFoundError('Analysis not found');
  }

  if (analysis.user_id !== userId) {
    throw new ForbiddenError('Access denied');
  }

  // Cache completed analyses
  if (analysis.status === 'COMPLETED') {
    await redis.setex(cacheKey, 86400, JSON.stringify(analysis));
  }

  return analysis;
}

/**
 * List user's analyses with pagination
 */
export async function listAnalyses(
  userId: string,
  params: { page: number; limit: number; status?: string }
) {
  const { page, limit, status } = params;
  const skip = (page - 1) * limit;

  const where: any = { user_id: userId };
  if (status) {
    where.status = status;
  }

  const [analyses, total] = await Promise.all([
    prisma.analysis.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        url: true,
        platform: true,
        status: true,
        product_name: true,
        product_image: true,
        authenticity_score: true,
        trust_label: true,
        recommendation: true,
        created_at: true,
        completed_at: true,
      },
    }),
    prisma.analysis.count({ where }),
  ]);

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return { analyses, meta };
}

/**
 * Delete an analysis
 */
export async function deleteAnalysis(analysisId: string, userId: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
  });

  if (!analysis) {
    throw new NotFoundError('Analysis not found');
  }

  if (analysis.user_id !== userId) {
    throw new ForbiddenError('Access denied');
  }

  await prisma.analysis.delete({
    where: { id: analysisId },
  });

  // Clear cache
  const redis = getRedisClient();
  await redis.del(`analysis:result:${analysisId}`);

  return { message: 'Analysis deleted successfully' };
}

/**
 * Get review breakdown for an analysis
 */
export async function getReviewBreakdown(analysisId: string, userId: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { reviews: true },
  });

  if (!analysis) throw new NotFoundError('Analysis not found');
  if (analysis.user_id !== userId) throw new ForbiddenError('Access denied');

  return {
    reviews: analysis.reviews,
    stats: analysis.reviews[0] || null,
  };
}

/**
 * Get price comparisons for an analysis
 */
export async function getPriceComparisons(analysisId: string, userId: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      price_comparisons: {
        orderBy: { price: 'asc' },
      },
    },
  });

  if (!analysis) throw new NotFoundError('Analysis not found');
  if (analysis.user_id !== userId) throw new ForbiddenError('Access denied');

  return {
    comparisons: analysis.price_comparisons,
  };
}
