import { prisma } from '../config/database';
import { getRedisClient } from '../config/redis';
import { SellerReputationResult } from '../types';
import { computeSellerTrustScore, getSellerTrustLabel } from '../utils/scoreCalculator';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Seller Reputation Service
 * Evaluates seller trustworthiness using DB cache and flagged seller list
 */

// Load flagged sellers list
let flaggedSellers: any[] = [];
try {
  const filePath = path.join(__dirname, '..', '..', 'data', 'flagged-sellers.json');
  flaggedSellers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
} catch (err) {
  logger.warn('Could not load flagged sellers file:', err);
}

/**
 * Check seller reputation
 */
export async function checkSellerReputation(
  sellerName: string,
  platform: string,
  sellerId?: string
): Promise<SellerReputationResult> {
  const normalizedName = sellerName.trim();
  const normalizedId = sellerId || normalizedName.toLowerCase().replace(/\s+/g, '_');

  // 1. Check Redis cache first
  const redis = getRedisClient();
  const cacheKey = `seller:cache:${platform}:${normalizedId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    logger.info(`Seller cache hit: ${normalizedName}`);
    return JSON.parse(cached);
  }

  // 2. Check DB
  let sellerRecord = await prisma.seller.findFirst({
    where: {
      platform,
      seller_id: normalizedId,
    },
  });

  // Check if stale (>7 days)
  const isStale = sellerRecord
    ? sellerRecord.last_checked &&
      Date.now() - sellerRecord.last_checked.getTime() > 7 * 24 * 60 * 60 * 1000
    : true;

  // 3. Check against flagged sellers list
  const flagged = flaggedSellers.filter(
    (s) =>
      s.platform === platform &&
      (s.seller_id === normalizedId ||
        s.name.toLowerCase() === normalizedName.toLowerCase())
  );

  const riskFlags: string[] = flagged.map((f) => f.reason);

  // 4. Compute trust score
  const rating = sellerRecord?.rating || 3.5;
  const reviewCount = sellerRecord?.review_count || 0;
  const isVerified = sellerRecord?.verified || false;
  const existingFlags = (sellerRecord?.flags as string[]) || [];
  const allFlags = [...new Set([...existingFlags, ...riskFlags])];

  const trustScore = computeSellerTrustScore({
    rating,
    reviewCount,
    flagCount: allFlags.length,
    isVerified,
  });

  const trustLabel = getSellerTrustLabel(trustScore);

  // 5. Upsert seller record
  try {
    sellerRecord = await prisma.seller.upsert({
      where: {
        platform_seller_id: {
          platform,
          seller_id: normalizedId,
        },
      },
      create: {
        name: normalizedName,
        platform,
        seller_id: normalizedId,
        rating,
        review_count: reviewCount,
        trust_score: trustScore,
        flags: allFlags,
        verified: isVerified,
        last_checked: new Date(),
      },
      update: {
        trust_score: trustScore,
        flags: allFlags,
        last_checked: new Date(),
      },
    });
  } catch (error) {
    logger.warn('Failed to upsert seller record:', error);
  }

  // Build recommendation
  let recommendation = '';
  if (trustLabel === 'HIGH') {
    recommendation = `${normalizedName} appears to be a reputable seller on ${platform} with good ratings.`;
  } else if (trustLabel === 'MEDIUM') {
    recommendation = `${normalizedName} has an average reputation. Verify product authenticity before purchasing.`;
  } else if (trustLabel === 'LOW') {
    recommendation = `Caution: ${normalizedName} has a low trust score. Consider purchasing from a more reputable seller.`;
  } else {
    recommendation = `Insufficient data to evaluate ${normalizedName}. Proceed with caution.`;
  }

  const result: SellerReputationResult = {
    seller_name: normalizedName,
    platform,
    rating,
    review_count: reviewCount,
    trust_score: trustScore,
    trust_label: trustLabel,
    flags: allFlags,
    verified: isVerified,
    recommendation,
  };

  // Cache for 7 days
  await redis.setex(cacheKey, 604800, JSON.stringify(result));

  return result;
}
