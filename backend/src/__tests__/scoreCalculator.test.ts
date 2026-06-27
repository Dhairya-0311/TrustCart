import { computeAuthenticityScore, getTrustLabel, getRecommendation, isRatingDistributionNormal, computeSellerTrustScore } from '../utils/scoreCalculator';

describe('scoreCalculator', () => {

  describe('computeAuthenticityScore', () => {
    it('returns ~100 for a perfect product', () => {
      const score = computeAuthenticityScore({
        reviewFakePercentage: 0,
        sellerTrustScore: 100,
        ratingDistributionNormal: true,
        burstDetected: false,
        incentivizedLanguageFound: false,
        verifiedPurchaseRatio: 1.0,
      });
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('returns low score for many fake reviews', () => {
      const score = computeAuthenticityScore({
        reviewFakePercentage: 90,
        sellerTrustScore: 30,
        ratingDistributionNormal: false,
        burstDetected: true,
        incentivizedLanguageFound: true,
        verifiedPurchaseRatio: 0.1,
      });
      expect(score).toBeLessThan(30);
    });

    it('clamps to 0-100', () => {
      const low = computeAuthenticityScore({
        reviewFakePercentage: 100,
        sellerTrustScore: 0,
        ratingDistributionNormal: false,
        burstDetected: true,
        incentivizedLanguageFound: true,
        verifiedPurchaseRatio: 0,
      });
      expect(low).toBeGreaterThanOrEqual(0);
      expect(low).toBeLessThanOrEqual(100);
    });
  });

  describe('getTrustLabel', () => {
    it('returns TRUSTED for score >= 71', () => {
      expect(getTrustLabel(71)).toBe('TRUSTED');
      expect(getTrustLabel(100)).toBe('TRUSTED');
    });
    it('returns SUSPICIOUS for 41-70', () => {
      expect(getTrustLabel(50)).toBe('SUSPICIOUS');
      expect(getTrustLabel(41)).toBe('SUSPICIOUS');
    });
    it('returns FAKE for < 41', () => {
      expect(getTrustLabel(10)).toBe('FAKE');
      expect(getTrustLabel(0)).toBe('FAKE');
    });
  });

  describe('getRecommendation', () => {
    it('returns BUY for trusted products', () => {
      expect(getRecommendation(85)).toBe('BUY');
    });
    it('returns CAUTION for suspicious products', () => {
      expect(getRecommendation(55)).toBe('CAUTION');
    });
    it('returns AVOID for fake products', () => {
      expect(getRecommendation(20)).toBe('AVOID');
    });
  });

  describe('isRatingDistributionNormal', () => {
    it('returns false for J-curve pattern', () => {
      expect(isRatingDistributionNormal({ '5': 90, '1': 5, '2': 2, '3': 2, '4': 1 })).toBe(false);
    });
    it('returns true for normal distribution', () => {
      expect(isRatingDistributionNormal({ '5': 30, '4': 25, '3': 20, '2': 15, '1': 10 })).toBe(true);
    });
    it('handles empty distribution', () => {
      expect(isRatingDistributionNormal({})).toBe(true);
    });
  });

  describe('computeSellerTrustScore', () => {
    it('gives high score to reputable verified sellers', () => {
      const score = computeSellerTrustScore({
        rating: 4.8,
        reviewCount: 5000,
        accountAgeDays: 730,
        flagCount: 0,
        isVerified: true,
      });
      expect(score).toBeGreaterThan(70);
    });

    it('gives low score to flagged sellers', () => {
      const score = computeSellerTrustScore({
        rating: 3.0,
        reviewCount: 50,
        flagCount: 2,
        isVerified: false,
      });
      expect(score).toBeLessThan(50);
    });
  });
});
