import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAnalysisList } from '../hooks/useAnalysis';
import { analysisApi } from '../api/analysis.api';
import type { Analysis } from '../types';

function getScoreColor(score: number | null) {
  if (!score) return 'text-outline';
  if (score >= 80) return 'text-secondary';
  if (score >= 50) return 'text-on-surface';
  return 'text-error';
}

function getScoreStrokeColor(score: number | null) {
  if (!score) return 'stroke-outline';
  if (score >= 80) return 'stroke-secondary';
  if (score >= 50) return 'stroke-primary';
  return 'stroke-error';
}

function getScoreEmoji(score: number | null) {
  if (!score) return '🔍';
  if (score >= 80) return '🥳'; // Above 80: dancing / happy / 🥳
  if (score >= 70) return '😊'; // Happy
  if (score >= 50) return '😐'; // Neutral
  return '😢'; // Bad: sad emoji
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <span className="badge-verified"><span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> COMPLETED</span>;
    case 'PROCESSING':
      return <span className="badge bg-surface-container-high text-on-surface-variant">PROCESSING</span>;
    case 'PENDING':
      return <span className="badge bg-surface-container text-outline">PENDING</span>;
    case 'FAILED':
      return <span className="badge-warning">FAILED</span>;
    default:
      return null;
  }
}

function MiniGauge({ score }: { score: number | null }) {
  const val = score || 0;
  return (
    <div className="relative w-16 h-16">
      <svg className="gauge-svg w-16 h-16" viewBox="0 0 36 36">
        <path className="stroke-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
        <path className={getScoreStrokeColor(score)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${val}, 100`} strokeLinecap="round" strokeWidth="3" />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-label-mono text-label-mono ${getScoreColor(score)}`}>
        {val}%
      </div>
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: Analysis }) {
  return (
    <Link to={`/analysis/${analysis.id}`} className="card-hover flex flex-col overflow-hidden">
      {/* Image Header */}
      <div className="h-40 bg-surface-container-low relative overflow-hidden">
        {analysis.product_image ? (
          <img src={analysis.product_image} alt={analysis.product_name || 'Product'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">shopping_bag</span>
          </div>
        )}
        <div className="absolute top-4 right-4">{getStatusBadge(analysis.status)}</div>
      </div>

      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-data-lg text-primary truncate">
              {analysis.product_name || 'Processing...'} {getScoreEmoji(analysis.authenticity_score)}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {new Date(analysis.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          {analysis.status === 'COMPLETED' && <MiniGauge score={analysis.authenticity_score} />}
        </div>

        {analysis.verdict && (
          <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg border ${
            analysis.recommendation === 'BUY'
              ? 'bg-secondary/5 border-secondary/20'
              : analysis.recommendation === 'AVOID'
              ? 'bg-error-container border-error'
              : 'bg-surface-container border-outline-variant'
          }`}>
            <span className={`material-symbols-outlined text-[20px] ${
              analysis.recommendation === 'BUY' ? 'text-secondary' : analysis.recommendation === 'AVOID' ? 'text-error' : 'text-outline'
            }`}>
              {analysis.recommendation === 'BUY' ? 'check_circle' : analysis.recommendation === 'AVOID' ? 'warning' : 'info'}
            </span>
            <span className="text-body-sm font-medium truncate">{analysis.verdict}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="font-label-mono text-label-mono text-outline uppercase">
            {analysis.platform}
          </span>
          <span className="material-symbols-outlined text-outline text-[20px]">arrow_forward</span>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { data: listData, isLoading: listLoading } = useAnalysisList({ limit: 6 });
  const navigate = useNavigate();

  const analyses = listData?.data || [];

  const handleVerify = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await analysisApi.create(url.trim());
      if (res.data?.analysis_id) {
        navigate(`/analysis/${res.data.analysis_id}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to start analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-display-lg text-primary mb-2">
          Welcome back, {user?.name || 'Analyst'} 👋
        </h1>
        <p className="text-on-surface-variant text-body-md">
          Paste a product URL to begin verification or review your recent analyses below.
        </p>
      </div>

      {/* URL Input Card */}
      <div className="bg-white rounded-xl border border-outline-variant p-8 shadow-card mb-12">
        <h2 className="font-display text-data-lg text-on-surface mb-4">New Verification</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow flex items-center bg-surface-container-low rounded-lg border border-outline-variant px-4 focus-within:ring-2 focus-within:ring-secondary transition-all">
            <span className="material-symbols-outlined text-outline">link</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="Paste product link (Amazon.in, Flipkart, Myntra...)"
              className="w-full py-4 px-3 border-none bg-transparent focus:ring-0 focus:outline-none font-sans text-body-md text-on-surface placeholder-outline"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={loading || !url.trim()}
            className="btn-primary px-10 py-4 text-data-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Verify
                <span className="material-symbols-outlined">analytics</span>
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-body-sm text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </p>
        )}
      </div>

      {/* Recent Analyses */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-headline-lg text-on-background">Recent Analyses</h2>
        <Link to="/history" className="text-body-sm text-secondary font-bold hover:underline flex items-center gap-1">
          View All
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {listLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-0 overflow-hidden">
              <div className="h-40 shimmer-bg" />
              <div className="p-6 space-y-4">
                <div className="h-6 shimmer-bg rounded w-3/4" />
                <div className="h-4 shimmer-bg rounded w-1/2" />
                <div className="h-12 shimmer-bg rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-outline">analytics</span>
          </div>
          <h3 className="font-display text-data-lg text-primary mb-2">No Analyses Yet</h3>
          <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
            Paste a product URL above to get your first verification report with authenticity scoring, review analysis, and price comparison.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((a: Analysis) => (
            <AnalysisCard key={a.id} analysis={a} />
          ))}
        </div>
      )}
    </div>
  );
}
