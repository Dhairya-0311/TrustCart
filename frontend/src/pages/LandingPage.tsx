import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { analysisApi } from '../api/analysis.api';

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!url.trim()) return;
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
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
    <>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-28 pb-32">
        {/* Background blobs */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-secondary rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 text-center space-y-12">
          {/* Verified chip */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-secondary-container border border-secondary/20 text-on-secondary-container mx-auto">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span className="font-label-mono text-label-mono uppercase tracking-widest text-sm font-bold">
              Algorithmic Precision Verified
            </span>
          </div>

          <h1 className="font-display text-display-lg md:text-[72px] lg:text-[84px] md:leading-[80px] lg:leading-[92px] font-black tracking-tight text-on-background max-w-5xl mx-auto">
            Verify the Truth Behind Every{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-brand-600">Product Link.</span>
          </h1>

          <p className="font-sans text-body-md md:text-xl lg:text-2xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
            Stop guessing. Get instant algorithmic analysis of product authenticity, pricing history,
            and unbiased sentiment before you buy.
          </p>

          {/* URL Input */}
          <div className="w-full max-w-4xl mx-auto bg-white p-3 rounded-2xl shadow-elevated border border-outline-variant">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-grow flex items-center bg-white rounded-xl border border-outline-variant px-5 focus-within:ring-2 focus-within:ring-secondary/40 transition-all group/input">
                <span className="material-symbols-outlined text-outline text-[24px]">link</span>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="Paste product link (Amazon, Flipkart, etc.)"
                  className="w-full py-5 px-4 bg-transparent border-none focus:ring-0 focus:outline-none font-sans text-body-md text-on-surface placeholder-outline font-medium"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={loading || !url.trim()}
                className="btn-primary px-12 py-5 rounded-xl font-display text-data-lg font-bold flex-shrink-0 group/btn"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Verify
                    <span className="material-symbols-outlined text-[24px]">analytics</span>
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-body-md text-error text-left px-3 font-semibold">{error}</p>
            )}
          </div>

          {/* Indicators */}
          <div className="flex justify-center items-center gap-8 text-on-surface-variant pt-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[20px]">security</span>
              <span className="text-body-sm font-semibold">Anti-Scam Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[20px]">trending_up</span>
              <span className="text-body-sm font-semibold">Price Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[20px]">balance</span>
              <span className="text-body-sm font-semibold">Unbiased Scores</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-28 bg-surface-container-low border-t border-outline-variant/40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="mb-20 text-center">
            <h2 className="font-display text-headline-lg mb-4 text-on-background font-bold">How it Works</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-body-md">
              Our verification engine processes millions of data points across three core verification stages to ensure you make the right choice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Step 1: Analysis */}
            <div className="card p-8 flex flex-col justify-between group hover:border-secondary/35 transition-all duration-300">
              <div>
                {/* High Fidelity Mockup */}
                <div className="mb-8 w-full bg-slate-50 border border-outline-variant/40 rounded-xl p-5 h-[220px] flex flex-col justify-between shadow-sm relative overflow-hidden transition-all">
                  <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                    <span className="text-[12px] font-bold text-outline uppercase tracking-wider">Sentiment</span>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-error" />
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  </div>
                  {/* SVG Area Chart */}
                  <div className="relative h-20 w-full">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="sentiment-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#006a61" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#006a61" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 35 Q 25 10 50 20 T 100 5 L 100 40 L 0 40 Z" fill="url(#sentiment-grad)" />
                      <path d="M 0 35 Q 25 10 50 20 T 100 5" fill="none" stroke="#006a61" strokeWidth="2.5" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30">
                    <span className="text-[12px] font-bold text-outline uppercase tracking-wider">History</span>
                  </div>
                  {/* Mini Bar Chart */}
                  <div className="flex items-end justify-between h-14 w-full px-2">
                    {[30, 50, 40, 80, 60, 45, 90, 70, 85, 50].map((h, i) => (
                      <div key={i} className="w-1.5 bg-gradient-to-t from-secondary to-secondary-container rounded-full" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                <h3 className="font-display text-data-lg mb-3 text-on-surface font-bold">01. Analysis</h3>
                <p className="text-on-surface-variant text-body-sm leading-relaxed">
                  Our AI scans the product page for manipulative metadata, fake review patterns, and seller history inconsistencies.
                </p>
              </div>
            </div>

            {/* Step 2: Verification */}
            <div className="card p-8 flex flex-col justify-between group hover:border-secondary/35 transition-all duration-300">
              <div>
                {/* High Fidelity Mockup */}
                <div className="mb-8 w-full bg-slate-50 border border-outline-variant/40 rounded-xl p-5 h-[220px] flex gap-4 items-center justify-between shadow-sm relative overflow-hidden transition-all">
                  {/* Left: Log Rows */}
                  <div className="flex flex-col gap-2 w-1/3">
                    {[1, 2, 3].map((v) => (
                      <div key={v} className="flex items-center gap-2 p-1.5 rounded bg-white border border-outline-variant/30">
                        <span className="material-symbols-outlined text-[14px] text-secondary">database</span>
                        <div className="h-1.5 w-10 bg-outline/40 rounded-full" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Connecting Node */}
                  <div className="absolute left-[33%] top-1/2 -translate-y-1/2 w-[8%] h-[2px] bg-gradient-to-r from-secondary-fixed-dim to-secondary" />

                  {/* Center: Document Sheet with Checked Mark */}
                  <div className="w-1/3 bg-white border border-secondary rounded-xl p-3 flex flex-col items-center justify-center relative h-[85%]">
                    <span className="material-symbols-outlined text-[38px] text-secondary">verified_user</span>
                    <div className="h-2 w-12 bg-outline-variant/30 rounded-full mt-2" />
                    <div className="h-1.5 w-10 bg-outline-variant/20 rounded-full mt-1.5" />
                  </div>

                  {/* Right: Small table */}
                  <div className="w-1/3 bg-white border border-outline-variant/30 rounded-lg p-2 flex flex-col gap-1.5 text-[9px] font-mono">
                    <div className="flex justify-between border-b border-outline-variant/20 pb-1 text-outline font-bold uppercase">
                      <span>Run</span>
                      <span>Close</span>
                    </div>
                    {[
                      { r: '2.5M', c: '1.2M' },
                      { r: '3.0M', c: '1.4M' },
                      { r: '3.5M', c: '1.6M' }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between text-on-surface-variant">
                        <span>{row.r}</span>
                        <span className="text-secondary">{row.c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="font-display text-data-lg mb-3 text-on-surface font-bold">02. Verification</h3>
                <p className="text-on-surface-variant text-body-sm leading-relaxed">
                  Cross-referencing with global manufacturing databases and verified purchase registries to confirm product legitimacy.
                </p>
              </div>
            </div>

            {/* Step 3: Comparison */}
            <div className="card p-8 flex flex-col justify-between group hover:border-secondary/35 transition-all duration-300">
              <div>
                {/* High Fidelity Mockup */}
                <div className="mb-8 w-full bg-slate-50 border border-outline-variant/40 rounded-xl p-4 h-[220px] flex flex-col justify-between shadow-sm text-[10px] font-sans relative overflow-hidden transition-all">
                  {/* Header Tabs */}
                  <div className="flex gap-2 justify-end mb-1">
                    <span className="bg-secondary/10 text-secondary border border-secondary/20 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-[8px]">Authentic</span>
                    <span className="bg-secondary/10 text-secondary border border-secondary/20 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-[8px]">Best Deal</span>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="space-y-2">
                    {[
                      { name: 'Flipkart', checked: true, price: '₹12,999', best: false },
                      { name: 'Amazon.in', checked: true, price: '₹12,499', best: true },
                      { name: 'TrustCart', checked: true, price: '₹11,499', best: true }
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center justify-between p-1.5 rounded-lg border ${item.best ? 'border-secondary/40 bg-secondary/5' : 'border-outline-variant/20 bg-white'}`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-[14px] ${item.checked ? 'text-secondary' : 'text-error'}`}>
                            {item.checked ? 'check_circle' : 'cancel'}
                          </span>
                          <span className="font-bold text-on-surface">{item.name}</span>
                        </div>
                        
                        {/* Price Trajectory mini chart */}
                        <div className="flex gap-0.5 items-end h-4 px-2">
                          {[20, 45, 30, 60, item.best ? 15 : 40].map((h, j) => (
                            <div key={j} className={`w-1 rounded-full ${item.best ? 'bg-secondary' : 'bg-primary'}`} style={{ height: `${h}%` }} />
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-on-surface">{item.price}</span>
                          {item.best && (
                            <span className="bg-secondary text-on-secondary text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Best</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="font-display text-data-lg mb-3 text-on-surface font-bold">03. Comparison</h3>
                <p className="text-on-surface-variant text-body-sm leading-relaxed">
                  We find the same verified product across the web to ensure you're getting the absolute best market price.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Layers Showcase ── */}
      <section className="py-28 bg-background">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Visual Card - Price Comparison Engine */}
          <div className="relative order-2 lg:order-1 flex justify-center">
            <div className="bg-white rounded-2xl border border-outline-variant p-8 shadow-elevated relative z-10 w-full max-w-[500px] transition-all">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/35">
                <div>
                  <h4 className="font-display text-data-lg text-on-surface font-bold">Price Comparison Engine</h4>
                  <span className="text-body-sm text-on-surface-variant">Tracking across major Indian platforms</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { platform: 'Amazon.in', price: '₹12,499', status: 'In Stock', best: true },
                  { platform: 'Flipkart', price: '₹12,999', status: 'In Stock', best: false },
                  { platform: 'Myntra', price: '₹13,500', status: 'Out of Stock', best: false },
                ].map((item) => (
                  <div
                    key={item.platform}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      item.best ? 'border-secondary bg-secondary/5' : 'border-outline-variant/25 hover:bg-surface-container'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-on-surface text-lg block">{item.platform}</span>
                      <span className={`text-[13px] font-semibold ${item.status === 'In Stock' ? 'text-secondary' : 'text-error'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-on-surface text-xl">{item.price}</span>
                      {item.best && (
                        <span className="badge bg-secondary-container text-on-secondary-container text-[11px] font-bold py-1 px-2.5 rounded-full">
                          BEST DEAL
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full -z-10 filter blur-3xl" />
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="font-display text-headline-lg text-on-background font-bold">
              Trust Layers Powered by Data Transparency
            </h2>
            <p className="text-on-surface-variant text-body-md leading-relaxed">
              Every verification is accompanied by a comprehensive breakdown. We don't just give you a score; we show you the evidence collected from global shipping logs, retailer APIs, and historical datasets.
            </p>
            <ul className="space-y-6">
              {[
                { title: 'Avoid Scams', desc: 'Identify deceptive listings and counterfeit sellers before you share your credit card information.' },
                { title: 'Save Money', desc: 'Our price trajectory analysis predicts when prices will drop, ensuring you never overpay.' },
                { title: 'Unbiased Reviews', desc: 'We filter out incentivized "fake" reviews using neural network analysis to find what real customers are saying.' },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-on-surface text-lg">{item.title}</h5>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-28 bg-surface-container-low text-on-surface border-t border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center mb-16">
          <h2 className="font-display text-headline-lg mb-4 text-on-background font-bold">Stop The Guesswork. Start Verifying.</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-body-md">
            TrustCart users save an average of ₹3,500 per high-value purchase and avoid a scam attempt every 12 searches.
          </p>
        </div>
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Warning card */}
            <div className="card p-8 hover:border-error/35 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-error">shopping_bag</span>
                </div>
                <div>
                  <p className="text-body-sm text-on-surface-variant">Listing Price</p>
                  <p className="font-display text-[36px] font-bold text-on-surface">₹14,999</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-error">warning</span>
                <span className="text-body-sm font-semibold text-error">Detected high review manipulation</span>
              </div>
            </div>

            {/* Recommended card */}
            <div className="card border border-secondary/50 p-8 relative hover:border-secondary transition-all">
              <div className="absolute -top-3.5 right-6 bg-secondary text-white text-body-sm px-4 py-1 rounded-full font-bold shadow-md">
                Recommended
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-secondary/15 border border-secondary/35 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-secondary">verified</span>
                </div>
                <div>
                  <p className="text-body-sm text-on-surface-variant">TrustCart Best Price</p>
                  <p className="font-display text-[36px] font-bold text-secondary">₹11,499</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">verified</span>
                <span className="text-body-sm font-semibold text-secondary">100% Authentic. Lowest market price.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 bg-background">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-display text-headline-lg text-on-background font-bold">Ready for the Truth?</h2>
            <p className="text-on-surface-variant text-body-md leading-relaxed">
              Join 500,000+ smart shoppers who use TrustCart to secure their purchases and maximize their budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/auth')}
                className="btn-primary text-body-md px-10 py-5 rounded-xl font-display font-bold shadow-lg"
              >
                Get Started Free
              </button>
              <button className="bg-white border border-outline hover:bg-surface-container px-10 py-5 rounded-xl font-display text-body-md hover:text-primary transition-all active:scale-95 text-on-surface font-bold">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
