import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAnalysis } from '../hooks/useAnalysis';
import { useAnalysisStatus } from '../hooks/useAnalysisStatus';
import { usePriceComparisons } from '../hooks/usePriceComparisons';
import type { Analysis, PriceComparison } from '../types';

function getScoreColor(score: number) {
  if (score >= 80) return 'stroke-secondary';
  if (score >= 50) return 'stroke-primary';
  return 'stroke-error';
}

function getScoreTextColor(score: number) {
  if (score >= 80) return 'text-secondary';
  if (score >= 50) return 'text-on-surface';
  return 'text-error';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Highly Reliable';
  if (score >= 60) return 'Mostly Reliable';
  if (score >= 40) return 'Needs Caution';
  return 'High Risk';
}

function getScoreEmoji(score: number) {
  if (score >= 80) return '🥳'; // Above 80: dancing / happy / 🥳
  if (score >= 70) return '😊'; // Happy
  if (score >= 50) return '😐'; // Neutral
  return '😢'; // Bad: sad emoji
}

function GenuinenessGauge({ score }: { score: number }) {
  const strokeDasharray = `${(score / 100) * 125.6}, 125.6`;
  return (
    <div className="gauge-container w-[280px] h-[140px] mx-auto relative">
      <svg className="w-full" viewBox="0 0 100 50">
        <path className="fill-none stroke-surface-container" strokeWidth="12" d="M 10 50 A 40 40 0 0 1 90 50" />
        <path className={`fill-none ${getScoreColor(score)}`} strokeWidth="12" strokeLinecap="round" d="M 10 50 A 40 40 0 0 1 90 50" strokeDasharray={strokeDasharray} />
      </svg>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center flex flex-col items-center">
        <span className="font-display text-4xl font-extrabold leading-none text-on-surface">{score}%</span>
        <p className={`text-xs font-bold ${getScoreTextColor(score)} mt-1`}>{getScoreLabel(score)} {getScoreEmoji(score)}</p>
      </div>
    </div>
  );
}

function PriceRow({ comparison, isBest }: { comparison: PriceComparison; isBest: boolean }) {
  const platformAbbr = comparison.platform?.substring(0, 3).toUpperCase() || '???';
  return (
    <tr className={`${isBest ? 'bg-secondary/15 border-b border-white/20' : 'hover:bg-white/20 transition-colors border-b border-white/20'}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-bold text-[10px]">
            {platformAbbr}
          </div>
          <span className="font-medium">{comparison.platform}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-body-sm">
        <span className={comparison.in_stock ? 'text-on-secondary-container' : 'text-error'}>
          {comparison.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </td>
      <td className={`px-6 py-4 font-bold ${isBest ? 'text-secondary' : 'text-primary'}`}>
        {comparison.currency === 'INR' ? '₹' : '$'}{comparison.price?.toLocaleString()}
      </td>
      <td className="px-6 py-4">
        {isBest ? (
          <span className="badge-best">BEST PRICE</span>
        ) : (
          <span className="px-2 py-1 bg-surface-container text-body-sm rounded">Standard</span>
        )}
      </td>
      <td className="px-6 py-4">
        {comparison.url && comparison.in_stock ? (
          <a href={comparison.url} target="_blank" rel="noopener noreferrer">
            <span className="material-symbols-outlined text-outline hover:text-primary cursor-pointer">open_in_new</span>
          </a>
        ) : (
          <span className="material-symbols-outlined text-outline-variant">block</span>
        )}
      </td>
    </tr>
  );
}

const animationStyles = `
  @keyframes spin-custom {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-custom {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
  @keyframes shimmer-bg {
    0% { background-color: rgba(0, 198, 167, 0.01); }
    50% { background-color: rgba(0, 198, 167, 0.06); }
    100% { background-color: rgba(0, 198, 167, 0.01); }
  }
  @keyframes dots {
    0% { content: ""; }
    25% { content: "."; }
    50% { content: ".."; }
    75% { content: "..."; }
    100% { content: ""; }
  }
  .animate-spin-custom {
    animation: spin-custom 2s linear infinite;
  }
  .animate-pulse-custom {
    animation: pulse-custom 1.5s ease-in-out infinite;
  }
  .shimmer-active {
    animation: shimmer-bg 3s infinite ease-in-out;
  }
  .dots-anim::after {
    display: inline-block;
    animation: dots 1.5s infinite steps(4);
    content: "";
    width: 24px;
    text-align: left;
  }
`;

function ProcessingView({
  serverStatus,
  onComplete,
}: {
  serverStatus: string | undefined;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 99) {
          return prev + 1;
        }
        
        // Hold at 99% if the backend is not finished yet
        if (serverStatus === 'COMPLETED') {
          clearInterval(timer);
          return 100;
        }
        
        if (serverStatus === 'FAILED') {
          clearInterval(timer);
          return prev;
        }

        return prev;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [serverStatus, isComplete]);

  useEffect(() => {
    if (progress === 100 && !isComplete) {
      setIsComplete(true);
      const timeout = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [progress, isComplete, onComplete]);

  // Determine currentStep based on progress
  let currentStep = 0;
  if (progress >= 100) currentStep = 4;
  else if (progress >= 90) currentStep = 3;
  else if (progress >= 60) currentStep = 2;
  else if (progress >= 30) currentStep = 1;

  const steps = [
    { label: 'Scraping', icon: 'psychology' },
    { label: 'Reviews', icon: 'rate_review' },
    { label: 'Prices', icon: 'attach_money' },
    { label: 'Verdict', icon: 'gavel' },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-20">
      <style>{animationStyles}</style>
      <div className={`card p-12 text-center max-w-2xl mx-auto transition-all duration-500 border border-white/30 ${
        !isComplete ? 'shimmer-active animate-pulse-custom' : 'bg-white/40 backdrop-blur-md'
      }`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 ${
          isComplete ? 'bg-secondary text-white' : 'bg-secondary-container text-on-secondary-container'
        }`}>
          <span className={`material-symbols-outlined text-[40px] ${
            isComplete ? '' : 'animate-spin-custom'
          }`}>
            {isComplete ? 'check' : 'analytics'}
          </span>
        </div>
        <h2 className={`font-display text-headline-lg mb-2 transition-all duration-500 ${
          isComplete ? 'text-secondary font-bold' : 'text-on-surface'
        }`}>
          {isComplete ? (
            <span>Analysis Complete ✓</span>
          ) : (
            <span className="dots-anim">Analyzing Product</span>
          )}
        </h2>
        <p className="text-on-surface-variant text-body-md mb-8">
          {isComplete ? 'All data aggregated successfully' : 'Please wait while we audit the product details'}
        </p>

        {/* Progress bar */}
        <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden mb-4 relative">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00C6A7 0%, #007A65 100%)',
            }}
          />
        </div>
        <p className="font-label-mono text-label-mono text-outline">{progress}% COMPLETE</p>

        {/* Steps */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((s, idx) => {
            let badgeClass = 'border-white/20 bg-white/20 backdrop-blur-md text-outline';
            let iconName = s.icon;
            let iconClass = 'text-outline';

            if (idx < currentStep) {
              badgeClass = 'border-secondary bg-secondary text-white font-bold';
              iconName = 'check_circle';
              iconClass = 'text-white';
            } else if (idx === currentStep) {
              badgeClass = 'border-secondary bg-secondary/10 text-secondary font-bold';
              iconName = 'sync';
              iconClass = 'text-secondary animate-spin-custom';
            }

            return (
              <div key={s.label} className={`p-4 rounded-lg border transition-all duration-500 flex flex-col items-center justify-center gap-2 ${badgeClass}`}>
                <span className={`material-symbols-outlined text-[24px] ${iconClass}`}>
                  {iconName}
                </span>
                <p className="text-label-mono text-xs">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: analysisData, isLoading: analysisLoading } = useAnalysis(id!);
  const { data: statusData } = useAnalysisStatus(id!, true);
  const { data: pricesData } = usePriceComparisons(id!);
  const [animationFinished, setAnimationFinished] = useState(false);

  const analysis: Analysis | undefined = analysisData?.data?.analysis;

  useEffect(() => {
    // Skip loading animation if analysis is already completed or failed
    if (analysis && (analysis.status === 'COMPLETED' || analysis.status === 'FAILED')) {
      setAnimationFinished(true);
    }
  }, [analysis]);

  useEffect(() => {
    if (statusData?.status === 'COMPLETED' || statusData?.status === 'FAILED') {
      queryClient.invalidateQueries({ queryKey: ['analysis', id] });
      queryClient.invalidateQueries({ queryKey: ['prices', id] });
    }
  }, [statusData?.status, id, queryClient]);

  const prices: PriceComparison[] = pricesData?.data?.comparisons || analysis?.price_comparisons || [];
  const reviews = analysis?.reviews?.[0];

  // Determine best price
  const inStockPrices = prices.filter((p) => p.in_stock && p.price > 0);
  const bestPrice = inStockPrices.length > 0 ? Math.min(...inStockPrices.map((p) => p.price)) : null;

  if (analysisLoading) {
    return (
      <div className="max-w-[1280px] mx-auto px-gutter py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 card p-8"><div className="h-60 shimmer-bg rounded" /></div>
          <div className="lg:col-span-8 card p-8"><div className="h-60 shimmer-bg rounded" /></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-[1280px] mx-auto px-gutter py-20 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline mb-4">search_off</span>
        <h2 className="font-display text-headline-lg text-on-surface">Analysis Not Found</h2>
        <Link to="/dashboard" className="mt-4 inline-flex text-secondary font-bold hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Show processing view or error view if analysis failed
  const currentStatus = statusData?.status || analysis.status;
  if (currentStatus === 'FAILED') {
    return (
      <div className="max-w-[1280px] mx-auto px-gutter py-20 text-center">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
        <h2 className="font-display text-headline-lg text-on-surface">Analysis Failed</h2>
        <p className="text-on-surface-variant text-body-md mt-2">
          An unexpected error occurred while analyzing this product.
        </p>
        <Link to="/dashboard" className="mt-6 inline-flex text-secondary font-bold hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!animationFinished) {
    return (
      <ProcessingView
        serverStatus={currentStatus}
        onComplete={() => setAnimationFinished(true)}
      />
    );
  }

  const score = analysis.authenticity_score || 0;

  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-12">
      {/* ── Hero: Score + Product ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Gauge Card */}
        <div className="lg:col-span-4 card p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4">
            {analysis.trust_label === 'TRUSTED' && <span className="badge-verified"><span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified</span>}
            {analysis.trust_label === 'SUSPICIOUS' && <span className="badge-warning">Suspicious</span>}
            {analysis.trust_label === 'FAKE' && <span className="badge-warning">Fake</span>}
          </div>
          <h3 className="font-display text-headline-lg mb-8 text-on-surface">Genuineness Score</h3>
          <GenuinenessGauge score={score} />
          {analysis.verdict && (
            <p className="mt-6 text-center text-body-sm text-outline px-4 italic">"{analysis.verdict}"</p>
          )}
        </div>

        {/* Product Card */}
        <div className="lg:col-span-8 card overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-2/5 relative min-h-[300px] bg-white/20 backdrop-blur-sm">
            {analysis.product_image ? (
              <img src={analysis.product_image} alt={analysis.product_name || 'Product'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[64px] text-outline-variant">inventory_2</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          </div>
          <div className="md:w-3/5 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-label-mono text-label-mono bg-white/25 border border-white/25 px-2 py-0.5 rounded text-primary uppercase">{analysis.platform}</span>
              </div>
              <h2 className="font-display text-headline-lg mb-4 text-on-surface">
                {analysis.product_name || 'Unknown Product'}
              </h2>
              {reviews && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: i < Math.round(reviews.avg_rating) ? "'FILL' 1" : "'FILL' 0" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-body-sm text-on-surface-variant">
                    ({reviews.total_reviews.toLocaleString()} Reviews)
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {analysis.recommendation === 'BUY' && (
                <button className="btn-primary">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  View Best Deal
                </button>
              )}
              <Link to="/dashboard" className="btn-outline">Back</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Insights Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Review Authenticity */}
        <div className="lg:col-span-1 card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-data-lg text-on-surface">Review Authenticity</h3>
            <span className="material-symbols-outlined text-outline">info</span>
          </div>
          {reviews ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-body-sm font-medium">Human Reviews</span>
                  <span className="text-body-sm text-secondary font-bold">{(100 - (reviews.fake_percentage || 0)).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${100 - (reviews.fake_percentage || 0)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-body-sm font-medium">Suspected Bot/Incentivized</span>
                  <span className="text-body-sm text-error font-bold">{(reviews.fake_percentage || 0).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-error" style={{ width: `${reviews.fake_percentage || 0}%` }} />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant">
                <div className="flex items-center gap-3 text-on-surface-variant bg-white/20 border border-white/25 p-4 rounded-lg backdrop-blur-md">
                  <span className="material-symbols-outlined text-secondary">security_update_good</span>
                  <p className="text-body-sm">AI analysis has filtered {reviews.fake_review_count} suspicious reviews from the total score.</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">No review data available.</p>
          )}
        </div>

        {/* Price Comparison Table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-display text-data-lg text-on-surface">Price Comparison</h3>
            <span className="text-body-sm text-outline">Updated just now</span>
          </div>
          {prices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/20 backdrop-blur-md border-b border-white/25">
                    <th className="px-6 py-4 text-body-sm font-bold text-outline uppercase tracking-wider">Retailer</th>
                    <th className="px-6 py-4 text-body-sm font-bold text-outline uppercase tracking-wider">Availability</th>
                    <th className="px-6 py-4 text-body-sm font-bold text-outline uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-body-sm font-bold text-outline uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-body-sm font-bold text-outline uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {prices.map((p) => (
                    <PriceRow key={p.id} comparison={p} isBest={p.price === bestPrice && p.in_stock} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-outline mb-2">price_check</span>
              <p className="text-body-sm">No price comparisons available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Verification Methodology ── */}
      <section className="glass-effect rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/30">
        <div className="md:w-1/2">
          <h4 className="font-display text-headline-lg mb-4 text-on-surface">Verification Methodology</h4>
          <p className="text-body-md text-on-surface-variant mb-4">
            Our Genuineness Score is calculated by cross-referencing global SKU databases, review analysis with NLP models, and certified retail API feeds.
          </p>
          <div className="flex flex-wrap gap-4">
            {['Serial Match', 'Brand Registry', 'AI Sentiment Analysis'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-body-sm font-medium">
                <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="md:w-1/3 w-full bg-white/20 p-6 rounded-lg border border-white/30 shadow-sm backdrop-blur-md">
          <p className="font-label-mono text-label-mono text-outline mb-4">DATA SOURCE TRANSPARENCY</p>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-body-sm">
              <span>Review Engine</span>
              <span className="text-secondary font-bold">ACTIVE</span>
            </li>
            <li className="flex justify-between items-center text-body-sm">
              <span>Price Tracker</span>
              <span className="text-secondary font-bold">LIVE</span>
            </li>
            <li className="flex justify-between items-center text-body-sm">
              <span>Seller Database</span>
              <span className="text-secondary font-bold">VERIFIED</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
