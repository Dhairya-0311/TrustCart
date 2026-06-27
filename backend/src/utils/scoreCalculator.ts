import { ScoreInputs } from '../types';

/**
 * Computes the overall authenticity score (0–100) for a product listing.
 * Higher score = more trustworthy.
 *
 * Score starts at 100 and deductions are applied based on red flags.
 */
export function computeAuthenticityScore(inputs: ScoreInputs): number {
  let score = 100;

  // Deduction 1: Fake review percentage (up to -50 points)
  // If 100% reviews are fake → -50
  score -= inputs.reviewFakePercentage * 0.5;

  // Deduction 2: Seller trust score inverse (up to -20 points)
  // If seller has 0 trust → -20
  score -= (100 - inputs.sellerTrustScore) * 0.2;

  // Deduction 3: Abnormal rating distribution (-10 points)
  if (!inputs.ratingDistributionNormal) {
    score -= 10;
  }

  // Deduction 4: Review burst detected (-10 points)
  if (inputs.burstDetected) {
    score -= 10;
  }

  // Deduction 5: Incentivized language found (-15 points)
  if (inputs.incentivizedLanguageFound) {
    score -= 15;
  }

  // Bonus: Verified purchase ratio (up to +5 points)
  score += inputs.verifiedPurchaseRatio * 5;

  // Clamp to 0–100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Determines the trust label based on the authenticity score.
 */
export function getTrustLabel(score: number): 'TRUSTED' | 'SUSPICIOUS' | 'FAKE' | 'UNKNOWN' {
  if (score >= 71) return 'TRUSTED';
  if (score >= 41) return 'SUSPICIOUS';
  if (score >= 0) return 'FAKE';
  return 'UNKNOWN';
}

/**
 * Determines the recommendation based on the authenticity score.
 */
export function getRecommendation(score: number): 'BUY' | 'CAUTION' | 'AVOID' {
  if (score >= 71) return 'BUY';
  if (score >= 41) return 'CAUTION';
  return 'AVOID';
}

/**
 * Computes the seller trust score (0–100) from various inputs.
 */
export function computeSellerTrustScore(inputs: {
  rating: number;         // 0–5
  reviewCount: number;    // any positive number
  accountAgeDays?: number; // estimated account age in days
  flagCount: number;      // number of risk flags
  isVerified: boolean;    // platform verified badge
}): number {
  let score = 0;

  // Rating component: 0–5 scaled to 0–40 points
  score += (inputs.rating / 5) * 40;

  // Review count: logarithmic scale, 0–20 points
  // 10 reviews = ~5pts, 100 = ~10pts, 1000 = ~15pts, 10000 = ~20pts
  if (inputs.reviewCount > 0) {
    score += Math.min(20, (Math.log10(inputs.reviewCount) / 4) * 20);
  }

  // Account age: 0–20 points
  if (inputs.accountAgeDays !== undefined) {
    // 0 days = 0pts, 365+ days = 20pts
    score += Math.min(20, (inputs.accountAgeDays / 365) * 20);
  } else {
    score += 10; // Unknown → assume mid-range
  }

  // Flags: -30 points if any flags exist
  if (inputs.flagCount > 0) {
    score -= 30;
  }

  // Verified badge: +20 points
  if (inputs.isVerified) {
    score += 20;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Gets seller trust label from score
 */
export function getSellerTrustLabel(score: number): 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN' {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score >= 0) return 'LOW';
  return 'UNKNOWN';
}

/**
 * Checks if a rating distribution is normal (not polarized).
 * A polarized distribution has 5-star% + 1-star% > 80%.
 */
export function isRatingDistributionNormal(distribution: Record<string, number>): boolean {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  if (total === 0) return true;

  const oneStarPct = ((distribution['1'] || 0) / total) * 100;
  const fiveStarPct = ((distribution['5'] || 0) / total) * 100;

  return (oneStarPct + fiveStarPct) <= 80;
}
