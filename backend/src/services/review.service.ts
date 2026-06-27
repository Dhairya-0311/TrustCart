import { RawReview, ReviewAnalysisResult } from '../types';
import { generateSentimentSummary } from './ai.service';
import { logger } from '../utils/logger';

/**
 * Review Analysis Service
 * Implements 8 heuristic checks for fake review detection
 */

// Red-flag phrases for incentivized reviews
const INCENTIVIZED_PATTERNS = [
  /free.*in.*exchange.*review/i,
  /received.*for.*honest.*review/i,
  /got.*this.*at.*a.*discount/i,
  /provided.*free.*for.*testing/i,
  /amazing product.*shipping.*great.*quality/i,
  /\b(excellent|superb|outstanding)\b.*\b(product|quality|packaging)\b.*\b(highly recommend|must buy)\b/i,
  /i received this product/i,
  /i got this for free/i,
  /discount.*review/i,
  /sample.*product/i,
];

/**
 * Main review analysis function — runs all 8 heuristics
 */
export async function analyzeReviews(
  reviews: RawReview[],
  productName: string,
  metadata?: { review_count?: number; avg_rating?: number }
): Promise<ReviewAnalysisResult> {
  if (reviews.length === 0) {
    // Use metadata from JSON-LD/page scrape if available
    const metaReviewCount = metadata?.review_count || 0;
    const metaAvgRating = metadata?.avg_rating || 0;

    return {
      total_reviews: metaReviewCount,
      fake_count: 0,
      real_count: metaReviewCount,
      fake_percentage: 0,
      avg_rating: metaAvgRating,
      adjusted_rating: metaAvgRating,
      rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      suspicious_patterns: metaReviewCount > 0
        ? ['Individual reviews could not be extracted — analysis based on platform-reported aggregate data only']
        : [],
      sentiment_summary: metaReviewCount > 0
        ? `Platform reports ${metaReviewCount} reviews with an average rating of ${metaAvgRating}/5. Individual reviews were not available for deeper analysis.`
        : 'No reviews available for analysis.',
      confidence: metaReviewCount > 0 ? 0.3 : 0,
    };
  }

  const suspiciousPatterns: string[] = [];
  const reviewFlags = new Map<number, Set<string>>(); // index → set of flags

  // Initialize flags for each review
  reviews.forEach((_, i) => reviewFlags.set(i, new Set()));

  // ─── Heuristic 1: Burst Detection ───
  const burstResult = detectReviewBurst(reviews);
  if (burstResult.detected) {
    suspiciousPatterns.push(
      `Review burst detected: ${burstResult.burstCount} reviews in a 7-day window (${burstResult.burstPercentage.toFixed(0)}% of total)`
    );
    burstResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add('burst'));
  }

  // ─── Heuristic 2: Text Similarity ───
  const similarityResult = detectTextSimilarity(reviews);
  if (similarityResult.detected) {
    suspiciousPatterns.push(
      `${similarityResult.clusters} clusters of near-identical reviews found`
    );
    similarityResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add('similarity'));
  }

  // ─── Heuristic 3: Unverified Purchase Ratio ───
  const unverifiedResult = checkUnverifiedRatio(reviews);
  if (unverifiedResult.flagged) {
    suspiciousPatterns.push(
      `High unverified purchase ratio: ${unverifiedResult.ratio.toFixed(0)}% of reviews are not verified purchases`
    );
  }

  // ─── Heuristic 4: Incentivized Language ───
  const incentivizedResult = detectIncentivizedLanguage(reviews);
  if (incentivizedResult.detected) {
    suspiciousPatterns.push(
      `${incentivizedResult.count} reviews contain incentivized/promotional language`
    );
    incentivizedResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add('incentivized'));
  }

  // ─── Heuristic 5: Rating Distribution Anomaly ───
  const ratingDist = computeRatingDistribution(reviews);
  const distributionAnomaly = checkRatingDistributionAnomaly(ratingDist, reviews.length);
  if (distributionAnomaly.flagged) {
    suspiciousPatterns.push(
      `Polarized rating distribution: ${distributionAnomaly.fiveStarPct.toFixed(0)}% 5-star and ${distributionAnomaly.oneStarPct.toFixed(0)}% 1-star reviews`
    );
  }

  // ─── Heuristic 6: Reviewer Profile Red Flags ───
  const profileResult = checkReviewerProfiles(reviews);
  if (profileResult.detected) {
    suspiciousPatterns.push(
      `${profileResult.count} reviewers show suspicious profile patterns (single-review accounts, duplicates)`
    );
    profileResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add('profile'));
  }

  // ─── Heuristic 7: Generic/Vague Language ───
  const genericResult = detectGenericLanguage(reviews);
  if (genericResult.detected) {
    suspiciousPatterns.push(
      `${genericResult.percentage.toFixed(0)}% of reviews are very short or generic (<15 words)`
    );
    genericResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add('generic'));
  }

  // ─── Heuristic 8: AI-Generated Text Patterns ───
  const aiPatternResult = detectAIPatterns(reviews);
  if (aiPatternResult.detected) {
    suspiciousPatterns.push(
      `${aiPatternResult.count} reviews show AI-generated text patterns`
    );
    aiPatternResult.flaggedIndices.forEach((i) => reviewFlags.get(i)?.add('ai_generated'));
  }

  // ─── Compute Final Stats ───
  const fakeCount = [...reviewFlags.entries()].filter(
    ([_, flags]) => flags.size >= 2
  ).length;
  const realCount = reviews.length - fakeCount;
  const fakePercentage = (fakeCount / reviews.length) * 100;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Adjusted rating: only count non-flagged reviews
  const realReviews = reviews.filter(
    (_, i) => (reviewFlags.get(i)?.size || 0) < 2
  );
  const adjustedRating =
    realReviews.length > 0
      ? realReviews.reduce((sum, r) => sum + r.rating, 0) / realReviews.length
      : avgRating;

  // Confidence: based on number of reviews analyzed
  const confidence = Math.min(1, reviews.length / 50) * 0.8 + 0.2;

  // Generate sentiment summary
  let sentimentSummary: string;
  try {
    sentimentSummary = await generateSentimentSummary(productName, {
      totalReviews: reviews.length,
      fakePercentage,
      avgRating,
      adjustedRating,
      suspiciousPatterns,
    });
  } catch {
    sentimentSummary = `Analyzed ${reviews.length} reviews. ${fakePercentage.toFixed(0)}% flagged as potentially fake. Adjusted rating: ${adjustedRating.toFixed(1)}/5.`;
  }

  return {
    total_reviews: reviews.length,
    fake_count: fakeCount,
    real_count: realCount,
    fake_percentage: fakePercentage,
    avg_rating: Math.round(avgRating * 10) / 10,
    adjusted_rating: Math.round(adjustedRating * 10) / 10,
    rating_distribution: ratingDist,
    suspicious_patterns: suspiciousPatterns,
    sentiment_summary: sentimentSummary,
    confidence,
  };
}

// ─── Heuristic Implementations ───

function detectReviewBurst(reviews: RawReview[]): {
  detected: boolean;
  burstCount: number;
  burstPercentage: number;
  flaggedIndices: number[];
} {
  const dated = reviews
    .map((r, i) => ({ date: parseDate(r.date), index: i }))
    .filter((r) => r.date !== null)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  if (dated.length < 5) return { detected: false, burstCount: 0, burstPercentage: 0, flaggedIndices: [] };

  const WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  let maxBurstCount = 0;
  let burstIndices: number[] = [];

  for (let i = 0; i < dated.length; i++) {
    const windowEnd = dated[i].date!.getTime() + WINDOW_MS;
    const inWindow = dated.filter((d) => d.date!.getTime() >= dated[i].date!.getTime() && d.date!.getTime() <= windowEnd);

    if (inWindow.length > maxBurstCount) {
      maxBurstCount = inWindow.length;
      burstIndices = inWindow.map((d) => d.index);
    }
  }

  const burstPercentage = (maxBurstCount / reviews.length) * 100;
  const detected = burstPercentage > 40;

  return { detected, burstCount: maxBurstCount, burstPercentage, flaggedIndices: detected ? burstIndices : [] };
}

function detectTextSimilarity(reviews: RawReview[]): {
  detected: boolean;
  clusters: number;
  flaggedIndices: number[];
} {
  const flagged = new Set<number>();
  let clusters = 0;

  for (let i = 0; i < reviews.length; i++) {
    for (let j = i + 1; j < reviews.length; j++) {
      const textA = (reviews[i].body || '').toLowerCase().trim();
      const textB = (reviews[j].body || '').toLowerCase().trim();

      if (textA.length < 10 || textB.length < 10) continue;

      const similarity = computeJaccardSimilarity(textA, textB);
      if (similarity > 0.7) {
        flagged.add(i);
        flagged.add(j);
        clusters++;
      }
    }
  }

  return {
    detected: clusters > 0,
    clusters,
    flaggedIndices: [...flagged],
  };
}

function checkUnverifiedRatio(reviews: RawReview[]): {
  flagged: boolean;
  ratio: number;
} {
  const unverified = reviews.filter((r) => !r.verified_purchase).length;
  const ratio = (unverified / reviews.length) * 100;
  return { flagged: ratio > 60, ratio };
}

function detectIncentivizedLanguage(reviews: RawReview[]): {
  detected: boolean;
  count: number;
  flaggedIndices: number[];
} {
  const flagged: number[] = [];
  reviews.forEach((r, i) => {
    const text = `${r.title} ${r.body}`;
    for (const pattern of INCENTIVIZED_PATTERNS) {
      if (pattern.test(text)) {
        flagged.push(i);
        break;
      }
    }
  });

  return {
    detected: flagged.length > 0,
    count: flagged.length,
    flaggedIndices: flagged,
  };
}

function computeRatingDistribution(reviews: RawReview[]): Record<string, number> {
  const dist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  reviews.forEach((r) => {
    const key = String(Math.max(1, Math.min(5, Math.round(r.rating))));
    dist[key] = (dist[key] || 0) + 1;
  });
  return dist;
}

function checkRatingDistributionAnomaly(
  dist: Record<string, number>,
  total: number
): { flagged: boolean; fiveStarPct: number; oneStarPct: number } {
  if (total === 0) return { flagged: false, fiveStarPct: 0, oneStarPct: 0 };
  const fiveStarPct = ((dist['5'] || 0) / total) * 100;
  const oneStarPct = ((dist['1'] || 0) / total) * 100;
  return {
    flagged: fiveStarPct + oneStarPct > 80,
    fiveStarPct,
    oneStarPct,
  };
}

function checkReviewerProfiles(reviews: RawReview[]): {
  detected: boolean;
  count: number;
  flaggedIndices: number[];
} {
  // Check for duplicate reviewer names
  const authorCounts = new Map<string, number[]>();
  reviews.forEach((r, i) => {
    const author = (r.author || '').toLowerCase().trim();
    if (author && author !== 'anonymous') {
      const existing = authorCounts.get(author) || [];
      existing.push(i);
      authorCounts.set(author, existing);
    }
  });

  const flagged: number[] = [];
  authorCounts.forEach((indices) => {
    if (indices.length >= 2) {
      indices.forEach((i) => flagged.push(i));
    }
  });

  return {
    detected: flagged.length > 0,
    count: flagged.length,
    flaggedIndices: flagged,
  };
}

function detectGenericLanguage(reviews: RawReview[]): {
  detected: boolean;
  percentage: number;
  flaggedIndices: number[];
} {
  const flagged: number[] = [];
  reviews.forEach((r, i) => {
    const text = (r.body || '').trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount < 15 && wordCount > 0) {
      flagged.push(i);
    }
  });

  const percentage = (flagged.length / reviews.length) * 100;
  return {
    detected: percentage > 30,
    percentage,
    flaggedIndices: percentage > 30 ? flagged : [],
  };
}

function detectAIPatterns(reviews: RawReview[]): {
  detected: boolean;
  count: number;
  flaggedIndices: number[];
} {
  const fillerPhrases = [
    'in conclusion',
    'it is worth noting',
    'i would like to mention',
    'all in all',
    'to summarize',
    'having said that',
    'needless to say',
    'it goes without saying',
    'in my honest opinion',
    'from my perspective',
  ];

  const flagged: number[] = [];
  reviews.forEach((r, i) => {
    const text = (r.body || '').toLowerCase();
    let fillerCount = 0;
    fillerPhrases.forEach((phrase) => {
      if (text.includes(phrase)) fillerCount++;
    });

    // Flag if multiple filler phrases AND very formal/structured text
    if (fillerCount >= 2) {
      flagged.push(i);
    }
  });

  return {
    detected: flagged.length > 0,
    count: flagged.length,
    flaggedIndices: flagged,
  };
}

// ─── Helper Functions ───

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;

  // Try Indian date formats
  const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (match) {
    return new Date(`${match[2]} ${match[1]}, ${match[3]}`);
  }
  return null;
}

function computeJaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(textA.split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(textB.split(/\s+/).filter((w) => w.length > 3));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  wordsA.forEach((word) => {
    if (wordsB.has(word)) intersection++;
  });

  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
