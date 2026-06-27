// ─── Shared Frontend Types ──────────

export type Plan = 'FREE' | 'PRO';
export type Platform = 'AMAZON' | 'FLIPKART' | 'MYNTRA' | 'MEESHO' | 'SNAPDEAL' | 'NYKAA' | 'AJIO' | 'UNKNOWN';
export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type TrustLabel = 'TRUSTED' | 'SUSPICIOUS' | 'FAKE' | 'UNKNOWN';
export type Recommendation = 'BUY' | 'AVOID' | 'CAUTION';

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  created_at: string;
  _count?: {
    analyses: number;
    alerts: number;
  };
}

export interface Analysis {
  id: string;
  user_id: string;
  url: string;
  platform: Platform;
  status: AnalysisStatus;
  job_id: string | null;
  product_name: string | null;
  product_image: string | null;
  authenticity_score: number | null;
  trust_label: TrustLabel | null;
  verdict: string | null;
  recommendation: Recommendation | null;
  raw_data: any;
  error_message: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  reviews?: ReviewAnalysis[];
  price_comparisons?: PriceComparison[];
}

export interface ReviewAnalysis {
  id: string;
  analysis_id: string;
  total_reviews: number;
  fake_review_count: number;
  real_review_count: number;
  avg_rating: number;
  rating_distribution: Record<string, number>;
  fake_percentage: number;
  suspicious_patterns: string[] | null;
  sentiment_summary: string | null;
  created_at: string;
}

export interface PriceComparison {
  id: string;
  analysis_id: string;
  platform: string;
  price: number;
  currency: string;
  url: string;
  in_stock: boolean;
  seller_name: string | null;
  fetched_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  product_url: string;
  platform: string;
  target_price: number;
  current_price: number | null;
  triggered: boolean;
  triggered_at: string | null;
  created_at: string;
}

export interface AnalysisStatusResponse {
  id: string;
  status: AnalysisStatus;
  progress_pct: number;
  step: string;
  error_message: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: PaginationMeta;
}
