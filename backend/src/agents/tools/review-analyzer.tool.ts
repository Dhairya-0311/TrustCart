import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { analyzeReviews } from '../../services/review.service';
import { logger } from '../../utils/logger';

/**
 * LangChain Tool: Analyze Reviews
 * Detects fake reviews using heuristic + AI signals.
 */
export const reviewAnalyzerTool = new DynamicStructuredTool({
  name: 'analyze_reviews',
  description:
    'Analyzes product reviews for authenticity, detects fake reviews using heuristic + AI signals, and returns trust metrics including fake review percentage, adjusted rating, and suspicious patterns.',
  schema: z.object({
    reviews: z.array(
      z.object({
        author: z.string(),
        rating: z.number(),
        title: z.string(),
        body: z.string(),
        date: z.string(),
        verified_purchase: z.boolean(),
        helpful_votes: z.number(),
        images: z.array(z.string()),
      })
    ).describe('Array of raw review objects from the product page'),
    product_name: z.string().describe('Name of the product being analyzed'),
    metadata_review_count: z.number().optional().describe('Aggregate review count from page metadata (JSON-LD)'),
    metadata_avg_rating: z.number().optional().describe('Aggregate avg rating from page metadata (JSON-LD)'),
  }),
  func: async ({ reviews, product_name, metadata_review_count, metadata_avg_rating }) => {
    try {
      logger.info(`📊 Analyzing ${reviews.length} reviews for: ${product_name}`);

      const result = await analyzeReviews(reviews, product_name, {
        review_count: metadata_review_count,
        avg_rating: metadata_avg_rating,
      });

      logger.info(
        `✅ Review analysis complete: ${result.fake_percentage.toFixed(1)}% fake, adjusted rating: ${result.adjusted_rating}/5`
      );

      return JSON.stringify(result);
    } catch (error: any) {
      logger.error('Review analyzer tool error:', error);
      return JSON.stringify({
        error: true,
        message: error.message || 'Failed to analyze reviews',
      });
    }
  },
});

