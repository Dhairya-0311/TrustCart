import { Request } from 'express';

// ─── Auth Types ──────────────────────

export interface JwtPayload {
  id: string;
  email: string;
  plan: 'FREE' | 'PRO';
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─── API Response Types ──────────────

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Scraper Types ───────────────────

export interface ScrapedProduct {
  product_name: string;
  brand: string;
  price: number;
  currency: string;
  rating: number;
  review_count: number;
  seller_name: string;
  seller_rating?: number;
  seller_review_count?: number;
  images: string[];
  description: string;
  category: string;
  in_stock: boolean;
  platform: string;
  scraped_at: string;
  raw_reviews: RawReview[];
}

export interface RawReview {
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified_purchase: boolean;
  helpful_votes: number;
  images: string[];
}

// ─── Review Analysis Types ───────────

export interface ReviewAnalysisResult {
  total_reviews: number;
  fake_count: number;
  real_count: number;
  fake_percentage: number;
  avg_rating: number;
  adjusted_rating: number;
  rating_distribution: Record<string, number>;
  suspicious_patterns: string[];
  sentiment_summary: string;
  confidence: number;
}

// ─── Price Comparison Types ──────────

export interface PricePoint {
  platform: string;
  price: number;
  currency: string;
  url: string;
  in_stock: boolean;
  seller_name?: string;
  last_updated: string;
}

export interface PriceComparisonResult {
  comparisons: PricePoint[];
  best_price_platform: string;
  best_price: number;
  original_price: number;
  savings_amount: number;
  savings_percentage: number;
}

// ─── Seller Types ────────────────────

export interface SellerReputationResult {
  seller_name: string;
  platform: string;
  rating: number;
  review_count: number;
  trust_score: number;
  trust_label: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  flags: string[];
  verified: boolean;
  recommendation: string;
}

// ─── Agent Types ─────────────────────

export interface AgentVerdict {
  authenticity_score: number;
  trust_label: 'TRUSTED' | 'SUSPICIOUS' | 'FAKE' | 'UNKNOWN';
  recommendation: 'BUY' | 'AVOID' | 'CAUTION';
  verdict: string;
  key_positives: string[];
  key_concerns: string[];
  best_price_tip: string;
}

export interface AnalysisJobData {
  url: string;
  analysisId: string;
  userId: string;
}

// ─── Platform Detection ──────────────

export type PlatformType =
  | 'AMAZON'
  | 'FLIPKART'
  | 'MYNTRA'
  | 'MEESHO'
  | 'SNAPDEAL'
  | 'NYKAA'
  | 'AJIO'
  | 'UNKNOWN';

// ─── Score Calculator Types ──────────

export interface ScoreInputs {
  reviewFakePercentage: number;
  sellerTrustScore: number;
  ratingDistributionNormal: boolean;
  burstDetected: boolean;
  incentivizedLanguageFound: boolean;
  verifiedPurchaseRatio: number;
}

// ─── Flagged Seller Seed Type ────────

export interface FlaggedSeller {
  name: string;
  platform: string;
  seller_id: string;
  reason: string;
  category: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
}
