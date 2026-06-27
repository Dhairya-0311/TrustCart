import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { scrapeProductPage } from '../../services/scraper.service';
import { detectPlatform } from '../../utils/platformDetector';
import { logger } from '../../utils/logger';

/**
 * LangChain Tool: Scrape Product Page
 * Scrapes an e-commerce product listing and returns structured data.
 */
export const scrapeProductTool = new DynamicStructuredTool({
  name: 'scrape_product_page',
  description:
    'Scrapes a product listing page from an Indian e-commerce site and returns structured product data including name, price, rating, seller info, and raw reviews.',
  schema: z.object({
    url: z.string().describe('The full product URL to scrape'),
  }),
  func: async ({ url }) => {
    try {
      logger.info(`🔍 Scraping product page: ${url}`);

      const detection = detectPlatform(url);
      if (!detection.isValid) {
        return JSON.stringify({
          error: true,
          message: detection.error || 'Unsupported platform',
        });
      }

      const product = await scrapeProductPage(url, detection.platform);

      logger.info(
        `✅ Scraped: ${product.product_name} | ₹${product.price} | ${product.raw_reviews.length} reviews`
      );

      return JSON.stringify(product);
    } catch (error: any) {
      logger.error('Scrape tool error:', error);
      return JSON.stringify({
        error: true,
        message: error.message || 'Failed to scrape product page',
      });
    }
  },
});
