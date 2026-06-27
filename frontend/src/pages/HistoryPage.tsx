import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalysisList } from '../hooks/useAnalysis';
import type { Analysis } from '../types';

function getScoreColor(score: number | null) {
  if (!score) return 'stroke-outline';
  if (score >= 80) return 'stroke-secondary';
  if (score >= 50) return 'stroke-primary';
  return 'stroke-error';
}

function getScoreTextColor(score: number | null) {
  if (!score) return 'text-outline';
  if (score >= 80) return 'text-secondary';
  if (score >= 50) return 'text-on-surface';
  return 'text-error';
}

function getScoreEmoji(score: number | null) {
  if (!score) return '🔍';
  if (score >= 80) return '🥳'; // Above 80: dancing / happy / 🥳
  if (score >= 70) return '😊'; // Happy
  if (score >= 50) return '😐'; // Neutral
  return '😢'; // Bad: sad emoji
}

function MiniGauge({ score }: { score: number | null }) {
  const val = score || 0;
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="gauge-svg w-16 h-16" viewBox="0 0 36 36">
        <path className="stroke-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
        <path className={getScoreColor(score)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${val}, 100`} strokeLinecap="round" strokeWidth="3" />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-label-mono text-label-mono ${getScoreTextColor(score)}`}>
        {val}%
      </div>
    </div>
  );
}

function HistoryCard({ analysis }: { analysis: Analysis }) {
  const score = analysis.authenticity_score;
  const isCompleted = analysis.status === 'COMPLETED';
  const isFailed = analysis.status === 'FAILED';

  return (
    <Link to={`/analysis/${analysis.id}`} className="card-hover overflow-hidden flex flex-col">
      {/* Image */}
      <div className="h-48 bg-surface-container-low relative overflow-hidden">
        {analysis.product_image ? (
          <img src={analysis.product_image} alt={analysis.product_name || 'Product'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">shopping_bag</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          {isCompleted && score !== null && score >= 70 && (
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-label-mono font-label-mono rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              VERIFIED
            </span>
          )}
          {isFailed && (
            <span className="px-3 py-1 bg-error-container text-on-error-container text-label-mono font-label-mono rounded-full">FAILED</span>
          )}
          {!isCompleted && !isFailed && (
            <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-label-mono font-label-mono rounded-full">
              {analysis.status}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-display text-data-lg text-primary truncate">
              {analysis.product_name || 'Processing...'} {getScoreEmoji(score)}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {new Date(analysis.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          {isCompleted && <MiniGauge score={score} />}
        </div>

        {/* Alert */}
        {isCompleted && analysis.verdict && (
          <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg border ${
            analysis.recommendation === 'BUY'
              ? 'bg-secondary/5 border-secondary/20'
              : analysis.recommendation === 'AVOID'
              ? 'bg-error-container border-error'
              : 'bg-surface-container-highest border-outline-variant'
          }`}>
            <span className={`material-symbols-outlined text-[20px] ${
              analysis.recommendation === 'BUY' ? 'text-secondary' : analysis.recommendation === 'AVOID' ? 'text-error' : 'text-primary'
            }`}>
              {analysis.recommendation === 'BUY' ? 'check_circle' : analysis.recommendation === 'AVOID' ? 'warning' : 'info'}
            </span>
            <span className="text-body-sm font-medium truncate">{analysis.verdict}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-label-mono text-label-mono text-outline uppercase">{analysis.platform}</span>
          <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward</span>
        </div>
      </div>
    </Link>
  );
}

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading } = useAnalysisList({ page, limit: 9, status: statusFilter || undefined });

  const analyses: Analysis[] = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-12">
      {/* Header & Filters */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-display-lg text-primary mb-2">Analysis History</h1>
          <p className="text-on-surface-variant text-body-md max-w-2xl">
            Access your recent product verifications. All scores are backed by real-time algorithmic cross-referencing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-outline-variant px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-body-sm text-outline">filter_list</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-transparent border-none text-body-sm focus:ring-0 p-0 cursor-pointer text-on-surface"
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </header>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-0 overflow-hidden">
              <div className="h-48 shimmer-bg" />
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
            <span className="material-symbols-outlined text-[32px] text-outline">history</span>
          </div>
          <h3 className="font-display text-data-lg text-primary mb-2">No History Yet</h3>
          <p className="text-body-sm text-on-surface-variant mb-6">Start verifying products to build your history.</p>
          <Link to="/dashboard" className="btn-primary inline-flex">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Verification
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((a) => (
              <HistoryCard key={a.id} analysis={a} />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-10 h-10 flex items-center justify-center text-outline-variant hover:text-primary transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-label-mono transition-colors ${
                      p === page
                        ? 'bg-primary text-white'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                {meta.totalPages > 5 && (
                  <span className="w-10 h-10 flex items-center justify-center text-outline-variant">...</span>
                )}
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="w-10 h-10 flex items-center justify-center text-outline-variant hover:text-primary transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
