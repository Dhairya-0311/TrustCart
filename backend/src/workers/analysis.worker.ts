import { createAnalysisWorker, ANALYSIS_QUEUE_NAME } from '../config/queue';
import { prisma } from '../config/database';
import { getRedisClient } from '../config/redis';
import { connectDatabase } from '../config/database';
import { connectRedis } from '../config/redis';
import { executeTrustCartAgent } from '../agents/trustcart.agent';
import { logger } from '../utils/logger';
import { AnalysisJobData } from '../types';
import { Job } from 'bullmq';

/**
 * Analysis Worker
 * Processes analysis jobs from the BullMQ queue.
 * Runs as a separate process.
 */

async function processAnalysisJob(job: Job<AnalysisJobData>) {
  const { url, analysisId, userId } = job.data;
  const redis = getRedisClient();

  logger.info(`🔄 Processing analysis job: ${job.id} | URL: ${url}`);

  try {
    // Update status to PROCESSING
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'PROCESSING' },
    });

    // Progress callback
    const onProgress = async (step: string, percentage: number) => {
      logger.info(`  📈 [${percentage}%] ${step}`);
      await redis.setex(`analysis:progress:${job.id}`, 3600, String(percentage));
      await job.updateProgress(percentage);
    };

    await onProgress('Starting analysis', 10);

    // Execute the agent pipeline
    const result = await executeTrustCartAgent(url, analysisId, onProgress);

    await onProgress('Saving results', 90);

    // Save review analysis to DB
    if (result.reviewAnalysis && !result.reviewAnalysis.error) {
      await prisma.reviewAnalysis.create({
        data: {
          analysis_id: analysisId,
          total_reviews: result.reviewAnalysis.total_reviews || 0,
          fake_review_count: result.reviewAnalysis.fake_count || 0,
          real_review_count: result.reviewAnalysis.real_count || 0,
          avg_rating: result.reviewAnalysis.avg_rating || 0,
          rating_distribution: result.reviewAnalysis.rating_distribution || {},
          fake_percentage: result.reviewAnalysis.fake_percentage || 0,
          suspicious_patterns: result.reviewAnalysis.suspicious_patterns || [],
          sentiment_summary: result.reviewAnalysis.sentiment_summary || null,
        },
      });
    }

    // Save price comparisons to DB
    if (result.priceComparison?.comparisons) {
      for (const comp of result.priceComparison.comparisons) {
        await prisma.priceComparison.create({
          data: {
            analysis_id: analysisId,
            platform: comp.platform,
            price: comp.price,
            currency: comp.currency || 'INR',
            url: comp.url || '',
            in_stock: comp.in_stock ?? true,
            seller_name: comp.seller_name || null,
            fetched_at: new Date(),
          },
        });
      }
    }

    // Update the analysis record with final results
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'COMPLETED',
        product_name: result.scrapedData?.product_name || null,
        product_image: result.scrapedData?.images?.[0] || null,
        authenticity_score: result.verdict.authenticity_score,
        trust_label: result.verdict.trust_label as any,
        verdict: result.verdict.verdict,
        recommendation: result.verdict.recommendation as any,
        raw_data: {
          scraped: result.scrapedData,
          reviewAnalysis: result.reviewAnalysis,
          priceComparison: result.priceComparison,
          sellerReputation: result.sellerReputation,
          agentVerdict: result.verdict,
        },
        completed_at: new Date(),
      },
    });

    await onProgress('Analysis complete', 100);

    // Clear any cached result for this analysis (will be re-cached on next read)
    await redis.del(`analysis:result:${analysisId}`);

    logger.info(`✅ Analysis complete: ${analysisId} | Score: ${result.verdict.authenticity_score}`);

    return {
      analysisId,
      score: result.verdict.authenticity_score,
      recommendation: result.verdict.recommendation,
    };
  } catch (error: any) {
    logger.error(`❌ Analysis job failed: ${job.id}`, error);

    // Update analysis as FAILED
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'FAILED',
        error_message: error.message || 'Analysis failed unexpectedly',
      },
    });

    await redis.setex(`analysis:progress:${job.id}`, 3600, '0');

    throw error; // Re-throw so BullMQ can retry
  }
}

/**
 * Bootstrap the worker process
 */
async function startWorker() {
  logger.info('🚀 Starting TrustCart analysis worker...');

  // Connect to database and Redis
  await connectDatabase();
  await connectRedis();

  // Create and start the worker
  const worker = createAnalysisWorker(processAnalysisJob);

  logger.info(`✅ Worker listening on queue: ${ANALYSIS_QUEUE_NAME}`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Closing worker...`);
    await worker.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startWorker().catch((err) => {
  logger.error('Worker failed to start:', err);
  process.exit(1);
});
