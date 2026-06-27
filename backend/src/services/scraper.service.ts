import { logger } from '../utils/logger';
import { ScrapedProduct, RawReview } from '../types';
import { env } from '../config/env';
import { ScrapingError } from '../middleware/error.middleware';

/**
 * Scraper service — uses Playwright for dynamic pages.
 * Uses a multi-layer extraction strategy:
 *   1. JSON-LD structured data (most reliable)
 *   2. Open Graph / meta tags
 *   3. Platform-specific CSS selectors (fallback)
 *   4. Generic heuristic selectors (last resort)
 */

// ─── URL normalization ───────────────────────────────

/**
 * Normalize deep-link and mobile URLs to standard web URLs.
 * e.g. dl.flipkart.com → www.flipkart.com
 */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);

    // Flipkart deep links → standard web URL
    if (u.hostname === 'dl.flipkart.com') {
      // dl.flipkart.com/dl/<product-slug>/p/<id>?pid=XXX…
      // → www.flipkart.com/<product-slug>/p/<id>?pid=XXX
      const pathParts = u.pathname.replace(/^\/dl\//, '/');
      u.hostname = 'www.flipkart.com';
      u.pathname = pathParts;
      // Keep only the pid param (strip tracking params)
      const pid = u.searchParams.get('pid');
      if (pid) {
        u.search = `?pid=${pid}`;
      }
      return u.toString();
    }

    return url;
  } catch {
    return url;
  }
}

// ─── Platform-specific CSS selectors (fallback layer) ─

const PLATFORM_SELECTORS: Record<string, Record<string, string>> = {
  AMAZON: {
    title: '#productTitle',
    price: '.a-price-whole, #priceblock_ourprice, #priceblock_dealprice, .a-color-price',
    rating: '#acrPopover .a-icon-alt, .a-icon-alt',
    reviewCount: '#acrCustomerReviewText',
    seller: '#sellerProfileTriggerId, #merchant-info a',
    description: '#productDescription, #feature-bullets',
    brand: '#bylineInfo',
    image: '#landingImage, #imgBlkFront',
    reviews: '[data-hook="review"]',
    inStock: '#availability span',
    category: '#wayfinding-breadcrumbs_feature_div',
  },
  FLIPKART: {
    // Flipkart obfuscates class names — use multiple candidates and structural selectors
    title: 'span.VU-ZEz, span.B_NuCI, h1 span, .pdp-title, [class*="ProductTitle"], .G6XhRU a, h1',
    price: 'div.Nx9bqj._4b5DiR, div._30jeq3._16Jk6d, div._30jeq3, [class*="SellingPrice"], [class*="selling-price"]',
    rating: 'div.XQDdHH, div._3LWZlK, span._1lRcqv span, [class*="RatingBar"]',
    reviewCount: 'span.Wphh3N span, span._2_R_DZ span, [class*="RatingsCount"], [class*="ratings-count"]',
    seller: '#sellerName span, [class*="SellerName"] span, [class*="seller-name"]',
    description: 'div._1AN87F, div._1mXcCf, [class*="product-description"]',
    brand: 'span.G6XhRU, [class*="BrandName"]',
    image: 'img._396cs4, img._2r_T1I, img.DByuf4, [class*="ProductImage"] img, ._2_sXSF img, .CXW8mj img',
    reviews: 'div._27M-vq, div.col._2wzgFH, [class*="ReviewCard"], [class*="review-card"]',
    inStock: '._16FRp0, [class*="NotAvailable"]',
    category: '._1MR4o5, [class*="breadcrumb"]',
  },
  MYNTRA: {
    title: '.pdp-name, .pdp-title, h1.pdp-name',
    price: '.pdp-price strong, .pdp-discount-container .pdp-price',
    rating: '.index-overallRating div:first-child',
    reviewCount: '.index-ratingsCount',
    description: '.pdp-product-description-content',
    image: '.image-grid-image img, .image-grid-image',
    reviews: '.user-review',
    inStock: '.pdp-add-to-bag',
  },
  MEESHO: {
    title: '[class*="ProductTitle"], h1',
    price: '[class*="StyledPrice"], [class*="ProductPrice"], [class*="selling-price"]',
    rating: '[class*="RatingStars"]',
    reviewCount: '[class*="ReviewCount"]',
    image: '[class*="ProductImage"] img',
    reviews: '[class*="ReviewCard"]',
  },
  SNAPDEAL: {
    title: '.pdp-e-i-head, h1',
    price: '.payBlkBig, .pdp-final-price span',
    rating: '.avrg-rating',
    reviewCount: '.numbr-overwrap',
    seller: '.seller-info-name',
    image: '#bx-slider-left-image-panel img, .cloudzoom',
    reviews: '.reviewBox',
    description: '.detailsSubHdng + div',
  },
  NYKAA: {
    title: '.css-xjhr9g, h1.css-1gc4x7i, h1',
    price: '.css-1jczs19, .css-17ctnp, [class*="price"]',
    rating: '.css-1t5gbfz',
    reviewCount: '.css-19srwpo',
    image: '.css-1rzg3mz img, [class*="product-image"] img',
    reviews: '.css-1d6w6if',
  },
};

// ─── Main scraper ────────────────────────────────────

/**
 * Scrape a product page using Playwright with multi-layer extraction.
 */
export async function scrapeProductPage(
  url: string,
  platform: string
): Promise<ScrapedProduct> {
  let browser: any = null;

  // Normalize URL (deep links, mobile links, etc.)
  const normalizedUrl = normalizeUrl(url);
  if (normalizedUrl !== url) {
    logger.info(`🔗 Normalized URL: ${url} → ${normalizedUrl}`);
  }

  try {
    const { chromium } = await import('playwright');

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      locale: 'en-IN',
    });

    const page = await context.newPage();
    page.setDefaultTimeout(env.SCRAPER_TIMEOUT_MS);

    // Navigate to the normalized URL
    await page.goto(normalizedUrl, {
      waitUntil: 'domcontentloaded',
      timeout: env.SCRAPER_TIMEOUT_MS,
    });

    // Wait for page content to hydrate
    await page.waitForTimeout(3000);

    // ─── LAYER 1: JSON-LD structured data ─────────
    const jsonLd = await extractJsonLd(page);

    // ─── LAYER 2: Open Graph / meta tags ──────────
    const metaData = await extractMetaTags(page);

    // ─── LAYER 3: Platform-specific CSS selectors ─
    const selectors = PLATFORM_SELECTORS[platform] || PLATFORM_SELECTORS.AMAZON;
    const cssData = await extractViaCss(page, selectors);

    // ─── LAYER 4: Page title as last resort ───────
    const pageTitle = await page.title();

    // ─── Merge layers (higher priority first) ─────
    const rawProductName =
      jsonLd?.name ||
      cssData.product_name ||
      metaData.title ||
      cleanPageTitle(pageTitle, platform) ||
      'Unknown Product';
    const productName = deduplicateProductName(rawProductName);

    const price =
      jsonLd?.price ||
      parsePrice(cssData.price_text) ||
      metaData.price ||
      0;

    const rating =
      jsonLd?.rating ||
      parseRating(cssData.rating_text) ||
      0;

    const reviewCount =
      jsonLd?.reviewCount ||
      parseNumber(cssData.review_count_text) ||
      0;

    const productImage =
      jsonLd?.image ||
      cssData.image ||
      metaData.image ||
      '';

    const sellerName =
      cssData.seller_name ||
      jsonLd?.seller ||
      'Unknown Seller';

    const brand =
      jsonLd?.brand ||
      cssData.brand ||
      '';

    const description =
      cssData.description ||
      metaData.description ||
      jsonLd?.description ||
      '';

    // ─── Extract reviews ──────────────────────────
    const reviews = await extractReviews(page, platform, selectors);

    logger.info(`📦 Extraction layers — JSON-LD: ${!!jsonLd?.name}, Meta: ${!!metaData.title}, CSS: ${!!cssData.product_name}, Title: ${!!pageTitle}`);

    await browser.close();

    return {
      product_name: productName,
      brand,
      price,
      currency: 'INR',
      rating,
      review_count: reviewCount,
      seller_name: sellerName,
      seller_rating: undefined,
      seller_review_count: undefined,
      images: productImage ? [productImage] : [],
      description,
      category: cssData.category || '',
      in_stock: !cssData.in_stock_text?.toLowerCase().includes('unavailable'),
      platform,
      scraped_at: new Date().toISOString(),
      raw_reviews: reviews,
    };
  } catch (error: any) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    logger.error(`Scraping failed for ${normalizedUrl}:`, error);
    throw new ScrapingError(
      `Failed to scrape product page: ${error.message || 'Unknown error'}`
    );
  }
}

// ─── LAYER 1: JSON-LD ────────────────────────────────

interface JsonLdProduct {
  name?: string;
  price?: number;
  image?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  seller?: string;
  description?: string;
}

async function extractJsonLd(page: any): Promise<JsonLdProduct | null> {
  try {
    const data = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent || '');
          // Could be a single object or an array
          const items = Array.isArray(json) ? json : [json];
          for (const item of items) {
            // Look for Product schema
            if (item['@type'] === 'Product' || item['@type']?.includes?.('Product')) {
              return item;
            }
            // Sometimes nested in @graph
            if (item['@graph']) {
              for (const g of item['@graph']) {
                if (g['@type'] === 'Product' || g['@type']?.includes?.('Product')) {
                  return g;
                }
              }
            }
          }
        } catch { /* skip malformed JSON-LD */ }
      }
      return null;
    });

    if (!data) return null;

    const price = data.offers?.price ||
      data.offers?.lowPrice ||
      data.offers?.highPrice ||
      (Array.isArray(data.offers) && data.offers[0]?.price) ||
      0;

    const image = typeof data.image === 'string'
      ? data.image
      : Array.isArray(data.image)
        ? data.image[0]
        : data.image?.url || '';

    const rating = data.aggregateRating?.ratingValue
      ? parseFloat(data.aggregateRating.ratingValue)
      : 0;

    const reviewCount = data.aggregateRating?.reviewCount
      ? parseInt(data.aggregateRating.reviewCount)
      : (data.aggregateRating?.ratingCount
        ? parseInt(data.aggregateRating.ratingCount)
        : 0);

    const seller = data.offers?.seller?.name ||
      (Array.isArray(data.offers) && data.offers[0]?.seller?.name) ||
      '';

    logger.info(`📋 JSON-LD found: "${data.name}" | ₹${price} | ⭐${rating} | ${reviewCount} reviews`);

    return {
      name: data.name || '',
      price: parseFloat(String(price)) || 0,
      image,
      brand: typeof data.brand === 'string' ? data.brand : data.brand?.name || '',
      rating,
      reviewCount,
      seller,
      description: data.description || '',
    };
  } catch (error) {
    logger.warn('JSON-LD extraction failed:', error);
    return null;
  }
}

// ─── LAYER 2: Meta tags ──────────────────────────────

interface MetaTagData {
  title: string;
  description: string;
  image: string;
  price: number;
}

async function extractMetaTags(page: any): Promise<MetaTagData> {
  try {
    return await page.evaluate(() => {
      const getMeta = (names: string[]): string => {
        for (const name of names) {
          const el =
            document.querySelector(`meta[property="${name}"]`) ||
            document.querySelector(`meta[name="${name}"]`);
          if (el) {
            const content = el.getAttribute('content')?.trim();
            if (content) return content;
          }
        }
        return '';
      };

      const title = getMeta(['og:title', 'twitter:title']);
      const description = getMeta(['og:description', 'twitter:description', 'description']);
      const image = getMeta(['og:image', 'twitter:image']);
      const priceText = getMeta(['product:price:amount', 'og:price:amount', 'twitter:data1']);

      return {
        title,
        description,
        image,
        price: parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0,
      };
    });
  } catch (error) {
    logger.warn('Meta tag extraction failed:', error);
    return { title: '', description: '', image: '', price: 0 };
  }
}

// ─── LAYER 3: CSS selectors ──────────────────────────

async function extractViaCss(
  page: any,
  selectors: Record<string, string>
): Promise<Record<string, string>> {
  try {
    return await page.evaluate((sel: Record<string, string>) => {
      const getText = (selector: string): string => {
        if (!selector) return '';
        const candidates = selector.split(',').map((s) => s.trim());
        for (const s of candidates) {
          try {
            const el = document.querySelector(s);
            if (el) {
              const text = (el.textContent || '').trim();
              if (text) return text;
            }
          } catch { /* invalid selector */ }
        }
        return '';
      };

      const getImage = (selector: string): string => {
        if (!selector) return '';
        const candidates = selector.split(',').map((s) => s.trim());
        for (const s of candidates) {
          try {
            const el = document.querySelector(s) as HTMLImageElement | null;
            if (el) return el.src || el.getAttribute('data-src') || el.getAttribute('data-srcset')?.split(' ')[0] || '';
          } catch { /* invalid selector */ }
        }
        return '';
      };

      return {
        product_name: getText(sel.title || ''),
        price_text: getText(sel.price || ''),
        rating_text: getText(sel.rating || ''),
        review_count_text: getText(sel.reviewCount || ''),
        seller_name: getText(sel.seller || ''),
        description: getText(sel.description || ''),
        brand: getText(sel.brand || ''),
        image: getImage(sel.image || ''),
        in_stock_text: getText(sel.inStock || ''),
        category: getText(sel.category || ''),
      };
    }, selectors);
  } catch (error) {
    logger.warn('CSS extraction failed:', error);
    return {};
  }
}

// ─── Review extraction ───────────────────────────────

async function extractReviews(
  page: any,
  platform: string,
  selectors: Record<string, string>
): Promise<RawReview[]> {
  try {
    const reviewSelector = selectors.reviews;
    if (!reviewSelector) return [];

    // Try to scroll down to load reviews section
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(1000);

    const reviewElements = await page.$$(reviewSelector);
    if (reviewElements.length === 0) {
      logger.info(`ℹ️ No review elements found with selector: ${reviewSelector}`);
      return [];
    }

    const reviews: RawReview[] = [];

    for (const el of reviewElements.slice(0, 50)) {
      try {
        const review = await el.evaluate(
          (node: Element, plat: string) => {
            const getText = (sel: string): string => {
              const el = node.querySelector(sel);
              return el ? (el.textContent || '').trim() : '';
            };

            let author = '';
            let rating = 0;
            let title = '';
            let body = '';
            let date = '';
            let verified = false;
            let helpful = 0;

            if (plat === 'AMAZON') {
              author = getText('.a-profile-name');
              const ratingText = getText('.a-icon-alt');
              rating = parseFloat(ratingText) || 0;
              title = getText('[data-hook="review-title"] span');
              body = getText('[data-hook="review-body"] span');
              date = getText('[data-hook="review-date"]');
              verified = !!node.querySelector('[data-hook="avp-badge"]');
              const helpfulText = getText('[data-hook="helpful-vote-statement"]');
              helpful = parseInt(helpfulText) || 0;
            } else if (plat === 'FLIPKART') {
              // Try multiple possible selectors for Flipkart reviews
              author = getText('._2V5EHH') || getText('[class*="UserName"]') || getText('p:last-child');
              const ratingEl = node.querySelector('._3LWZlK') || node.querySelector('[class*="RatingBar"]') || node.querySelector('div > div:first-child');
              rating = ratingEl ? parseFloat(ratingEl.textContent || '0') : 0;
              title = getText('.t-ZTKy p:first-child') || getText('._2-N8zT') || getText('[class*="ReviewTitle"]');
              body = getText('.t-ZTKy') || getText('.qwjRop div') || getText('[class*="ReviewText"]') || (node.textContent || '').substring(0, 500);
              date = getText('._2sc7ZR') || getText('.rgkKRe') || getText('[class*="Date"]');
              verified = !!node.querySelector('._2mcZGG') || !!node.querySelector('[class*="Verified"]');
            } else {
              body = (node.textContent || '').trim().substring(0, 500);
            }

            return { author, rating, title, body, date, verified, helpful };
          },
          platform
        );

        if (review.body || review.title) {
          reviews.push({
            author: review.author || 'Anonymous',
            rating: review.rating,
            title: review.title,
            body: review.body,
            date: review.date,
            verified_purchase: review.verified,
            helpful_votes: review.helpful,
            images: [],
          });
        }
      } catch {
        // Skip failed review extraction
      }
    }

    logger.info(`📝 Extracted ${reviews.length} reviews from page`);
    return reviews;
  } catch (error) {
    logger.warn('Review extraction failed:', error);
    return [];
  }
}

// ─── Helpers ─────────────────────────────────────────

/**
 * Remove duplicate portions in product names.
 * e.g. "The Laws of Human Nature  - The Laws of Human Nature" → "The Laws of Human Nature"
 */
function deduplicateProductName(name: string): string {
  if (!name) return name;
  // Check for patterns like "X  - X" or "X | X" or "X - X"
  const separators = ['  - ', ' - ', ' | ', ' – ', ' — '];
  for (const sep of separators) {
    const idx = name.indexOf(sep);
    if (idx > 0) {
      const left = name.substring(0, idx).trim();
      const right = name.substring(idx + sep.length).trim();
      // If left contains right or right contains left, take the longer one
      if (left === right) return left;
      if (left.includes(right)) return left;
      if (right.includes(left)) return right;
    }
  }
  return name.trim();
}

function cleanPageTitle(title: string, platform: string): string {
  if (!title) return '';
  // Remove common suffixes like " - Amazon.in", "Buy ... on Flipkart", "| Flipkart.com"
  let cleaned = title
    .replace(/\s*[-|–—]\s*(Amazon\.in|Flipkart\.com|Flipkart|Myntra|Meesho|Snapdeal|Nykaa|Online Shopping|Buy Online).*/gi, '')
    .replace(/^Buy\s+/i, '')
    .replace(/\s*\(.*?\)\s*$/, '')
    .trim();
  return cleaned || title.trim();
}

function parsePrice(text: string): number {
  if (!text) return 0;
  const withoutCurrency = text.replace(/rs\.?/i, '').replace(/inr/i, '');
  const cleaned = withoutCurrency.replace(/[₹,\s]/g, '').replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

function parseRating(text: string): number {
  if (!text) return 0;
  const match = text.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseNumber(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/[,\s]/g, '');
  const match = cleaned.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
