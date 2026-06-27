import { PlatformType } from '../types';

/**
 * Detects the e-commerce platform from a product URL.
 * Supports Amazon.in, Flipkart, Myntra, Meesho, Snapdeal, Nykaa, and Ajio.
 */

interface PlatformDetectionResult {
  platform: PlatformType;
  hostname: string;
  isValid: boolean;
  error?: string;
}

const PLATFORM_PATTERNS: Array<{
  platform: PlatformType;
  hostnames: string[];
}> = [
  {
    platform: 'AMAZON',
    hostnames: ['amazon.in', 'www.amazon.in', 'amzn.in', 'amzn.to'],
  },
  {
    platform: 'FLIPKART',
    hostnames: ['flipkart.com', 'www.flipkart.com', 'dl.flipkart.com'],
  },
  {
    platform: 'MYNTRA',
    hostnames: ['myntra.com', 'www.myntra.com'],
  },
  {
    platform: 'MEESHO',
    hostnames: ['meesho.com', 'www.meesho.com'],
  },
  {
    platform: 'SNAPDEAL',
    hostnames: ['snapdeal.com', 'www.snapdeal.com'],
  },
  {
    platform: 'NYKAA',
    hostnames: ['nykaa.com', 'www.nykaa.com', 'nykaafashion.com', 'www.nykaafashion.com'],
  },
  {
    platform: 'AJIO',
    hostnames: ['ajio.com', 'www.ajio.com'],
  },
];

export function detectPlatform(url: string): PlatformDetectionResult {
  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      platform: 'UNKNOWN',
      hostname: '',
      isValid: false,
      error: 'Invalid URL format. Please provide a valid product URL.',
    };
  }

  // Must be http or https
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return {
      platform: 'UNKNOWN',
      hostname: parsedUrl.hostname,
      isValid: false,
      error: 'URL must use HTTP or HTTPS protocol.',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Match against known platform hostnames
  for (const entry of PLATFORM_PATTERNS) {
    if (entry.hostnames.includes(hostname)) {
      return {
        platform: entry.platform,
        hostname,
        isValid: true,
      };
    }
  }

  return {
    platform: 'UNKNOWN',
    hostname,
    isValid: false,
    error: `Unsupported platform: ${hostname}. Supported platforms: Amazon.in, Flipkart, Myntra, Meesho, Snapdeal, Nykaa, Ajio.`,
  };
}

/**
 * Returns a human-readable platform name
 */
export function getPlatformDisplayName(platform: PlatformType): string {
  const names: Record<PlatformType, string> = {
    AMAZON: 'Amazon.in',
    FLIPKART: 'Flipkart',
    MYNTRA: 'Myntra',
    MEESHO: 'Meesho',
    SNAPDEAL: 'Snapdeal',
    NYKAA: 'Nykaa',
    AJIO: 'Ajio',
    UNKNOWN: 'Unknown',
  };
  return names[platform];
}

/**
 * Builds a search URL for a given platform
 */
export function buildSearchUrl(platform: PlatformType, query: string): string {
  const encoded = encodeURIComponent(query);
  const searchUrls: Partial<Record<PlatformType, string>> = {
    AMAZON: `https://www.amazon.in/s?k=${encoded}`,
    FLIPKART: `https://www.flipkart.com/search?q=${encoded}`,
    MYNTRA: `https://www.myntra.com/${encoded}`,
    MEESHO: `https://www.meesho.com/search?q=${encoded}`,
    SNAPDEAL: `https://www.snapdeal.com/search?keyword=${encoded}`,
    NYKAA: `https://www.nykaa.com/search/result/?q=${encoded}`,
    AJIO: `https://www.ajio.com/search/?text=${encoded}`,
  };
  return searchUrls[platform] || `https://www.google.com/search?q=${encoded}+buy+online`;
}
