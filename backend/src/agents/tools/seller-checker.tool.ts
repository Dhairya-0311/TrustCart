import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { checkSellerReputation } from '../../services/seller.service';
import { logger } from '../../utils/logger';

/**
 * LangChain Tool: Check Seller Reputation
 * Evaluates seller trustworthiness using DB cache and flagged seller list.
 */
export const sellerCheckerTool = new DynamicStructuredTool({
  name: 'check_seller_reputation',
  description:
    "Evaluates a seller's reputation, history, and flags known problematic sellers. Returns a trust score (0-100), trust label, risk flags, and a recommendation.",
  schema: z.object({
    seller_name: z.string().describe('Name of the seller'),
    platform: z.string().describe('E-commerce platform (AMAZON, FLIPKART, etc.)'),
    seller_id: z.string().optional().describe("Platform's native seller ID if available"),
  }),
  func: async ({ seller_name, platform, seller_id }) => {
    try {
      logger.info(`🏪 Checking seller reputation: ${seller_name} on ${platform}`);

      const result = await checkSellerReputation(seller_name, platform, seller_id);

      logger.info(
        `✅ Seller check complete: ${result.trust_label} (score: ${result.trust_score}/100)`
      );

      return JSON.stringify(result);
    } catch (error: any) {
      logger.error('Seller checker tool error:', error);
      return JSON.stringify({
        error: true,
        message: error.message || 'Failed to check seller',
      });
    }
  },
});
