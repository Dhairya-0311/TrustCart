import { PriceComparisonResult, PricePoint, PlatformType } from '../types';
import { buildSearchUrl } from '../utils/platformDetector';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';
import * as crypto from 'crypto';

/**
 * Price Comparison Service
 * Fetches prices from multiple platforms for the same product
 */

const PLATFORMS_TO_CHECK: PlatformType[] = [
  'AMAZON', 'FLIPKART', 'SNAPDEAL',
];

/**
 * Fetch price comparisons across platforms
 */
export async function fetchPriceComparisons(
  productName: string,
  brand: string,
  currentPlatform: string,
  currentPrice: number
): Promise<PriceComparisonResult> {
  // Check cache first
  const redis = getRedisClient();
  const cacheKey = `price:cache:${hashString(`${brand} ${productName}`)}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    logger.info('Price comparison cache hit');
    return JSON.parse(cached);
  }

  // Use just product name for search (brand makes it too specific)
  const searchQuery = productName.trim();
  const comparisons: PricePoint[] = [];

  // Add current platform price
  comparisons.push({
    platform: currentPlatform,
    price: currentPrice,
    currency: 'INR',
    url: '',
    in_stock: true,
    last_updated: new Date().toISOString(),
  });

  // Skip cross-platform search if product name is unknown or too generic
  const isUnknown = !productName || productName === 'Unknown Product' || productName.length < 3;
  if (isUnknown) {
    logger.warn('⚠️ Skipping price comparison — product name is unknown or too short');
    return {
      comparisons,
      best_price_platform: currentPlatform,
      best_price: currentPrice,
      original_price: currentPrice,
      savings_amount: 0,
      savings_percentage: 0,
    };
  }

  // Search on other platforms in parallel
  const otherPlatforms = PLATFORMS_TO_CHECK.filter((p) => p !== currentPlatform);

  const searchPromises = otherPlatforms.map(async (platform) => {
    try {
      const pricePoint = await searchPlatformPrice(platform, searchQuery);
      if (pricePoint) {
        comparisons.push(pricePoint);
      }
    } catch (error) {
      logger.warn(`Price fetch failed for ${platform}:`, error);
    }
  });

  await Promise.all(searchPromises);

  // Find best price
  const validPrices = comparisons.filter((c) => c.price > 0 && c.in_stock);
  const bestPrice = validPrices.length > 0
    ? validPrices.reduce((min, c) => c.price < min.price ? c : min)
    : comparisons[0];

  const result: PriceComparisonResult = {
    comparisons,
    best_price_platform: bestPrice?.platform || currentPlatform,
    best_price: bestPrice?.price || currentPrice,
    original_price: currentPrice,
    savings_amount: Math.max(0, currentPrice - (bestPrice?.price || currentPrice)),
    savings_percentage: currentPrice > 0
      ? Math.max(0, ((currentPrice - (bestPrice?.price || currentPrice)) / currentPrice) * 100)
      : 0,
  };

  // Cache for 2 hours
  await redis.setex(cacheKey, 7200, JSON.stringify(result));

  return result;
}

/**
 * Search a specific platform for the product price
 */
async function searchPlatformPrice(
  platform: PlatformType,
  searchQuery: string
): Promise<PricePoint | null> {
  let browser: any = null;
  try {
    const { chromium } = await import('playwright');

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      extraHTTPHeaders: {
        'Accept-Language': 'en-IN,en-GB;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    const page = await context.newPage();

    // Bypass basic navigator.webdriver detection
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    const searchUrl = buildSearchUrl(platform, searchQuery);

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Extract first search result price based on platform
    const result = await extractSearchResult(page, platform);

    if (result && result.price > 0) {
      return {
        platform,
        price: result.price,
        currency: 'INR',
        url: result.url || searchUrl,
        in_stock: true,
        seller_name: result.seller,
        last_updated: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    logger.warn(`Search on ${platform} failed:`, error);
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        logger.error(`Failed to close browser for ${platform}:`, closeError);
      }
    }
  }
}

/**
 * Extract search result from a platform's search page
 */
async function extractSearchResult(
  page: any,
  platform: PlatformType
): Promise<{ price: number; url: string; seller?: string } | null> {
  try {
    return await page.evaluate((plat: string) => {
      const config: Record<string, { container: string; price: string; link: string }> = {
        AMAZON: {
          container: '[data-component-type="s-search-result"], .s-result-item',
          price: '.a-price-whole, .a-offscreen',
          link: 'h2 a, .a-link-normal',
        },
        FLIPKART: {
          container: 'div.CGtC98, div._757ZBr, div._1sdMkc, div[data-id], ._1AtVb7',
          price: '.Nx9bqj, ._30jeq3',
          link: 'a.CGtC98, a._1fQZEK, a[href*="/p/"]',
        },
        SNAPDEAL: {
          container: '.product-tuple-listing, .fav-tuple, [class*="product-tuple"]',
          price: '.product-price, .lfloat.product-price',
          link: 'a.dp-trigger, a[href*="/product/"]',
        },
        MEESHO: {
          container: '[class*="ProductCard"], a[href*="/product/"]',
          price: '[class*="Price"]',
          link: 'a',
        },
        MYNTRA: {
          container: '.product-base',
          price: '.product-discountedPrice, .product-price',
          link: 'a',
        },
        NYKAA: {
          container: '.css-qlopj4, [class*="product-card"]',
          price: '.css-111z9ua, .css-17ctnp',
          link: 'a',
        }
      };

      const sel = config[plat] || config.AMAZON;
      const containers = Array.from(document.querySelectorAll(sel.container));

      for (const container of containers) {
        const priceEl = container.querySelector(sel.price);
        const linkEl = container.querySelector(sel.link) as HTMLAnchorElement | null;

        if (priceEl && linkEl) {
          let priceText = priceEl.textContent?.trim() || '';
          priceText = priceText.replace(/rs\.?/i, '').replace(/inr/i, '');
          priceText = priceText.replace(/[₹,\s]/g, '').replace(/[^0-9.]/g, '');
          const price = parseFloat(priceText) || 0;

          const url = linkEl.href || '';

          if (price > 0 && url) {
            return {
              price,
              url,
            };
          }
        }
      }

      // Fallback: search globally on page
      const priceEl = document.querySelector(sel.price);
      const linkEl = document.querySelector(sel.link) as HTMLAnchorElement | null;
      if (priceEl && linkEl) {
        let priceText = priceEl.textContent?.trim() || '';
        priceText = priceText.replace(/rs\.?/i, '').replace(/inr/i, '');
        priceText = priceText.replace(/[₹,\s]/g, '').replace(/[^0-9.]/g, '');
        const price = parseFloat(priceText) || 0;
        const url = linkEl.href || '';
        if (price > 0 && url) {
          return { price, url };
        }
      }

      return null;
    }, platform);
  } catch {
    return null;
  }
}

function hashString(str: string): string {
  return crypto.createHash('md5').update(str.toLowerCase()).digest('hex');
}
