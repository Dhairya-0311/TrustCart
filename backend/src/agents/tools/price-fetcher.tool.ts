import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { fetchPriceComparisons } from '../../services/price.service';
import { logger } from '../../utils/logger';

/**
 * LangChain Tool: Fetch Price Comparisons
 * Searches for the same product on other platforms and returns prices.
 */
export const priceFetcherTool = new DynamicStructuredTool({
  name: 'fetch_price_comparisons',
  description:
    'Searches for the same product on other Indian e-commerce platforms (Amazon, Flipkart, Snapdeal, Meesho, Myntra, Nykaa) and returns current prices to find the best deal.',
  schema: z.object({
    product_name: z.string().describe('Name of the product'),
    brand: z.string().describe('Brand name of the product'),
    current_platform: z.string().describe('Platform the product was originally found on'),
    current_price: z.number().describe('Current price on the original platform'),
  }),
  func: async ({ product_name, brand, current_platform, current_price }) => {
    try {
      logger.info(`💰 Fetching price comparisons for: ${brand} ${product_name}`);

      const result = await fetchPriceComparisons(
        product_name,
        brand,
        current_platform,
        current_price
      );

      logger.info(
        `✅ Found ${result.comparisons.length} price points. Best: ₹${result.best_price} on ${result.best_price_platform}`
      );

      return JSON.stringify(result);
    } catch (error: any) {
      logger.error('Price fetcher tool error:', error);
      return JSON.stringify({
        error: true,
        message: error.message || 'Failed to fetch prices',
      });
    }
  },
});
