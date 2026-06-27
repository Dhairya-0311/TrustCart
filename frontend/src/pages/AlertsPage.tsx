import { useState, useEffect } from 'react';
import { alertApi } from '../api/alert.api';
import type { PriceAlert } from '../types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchAlerts = async () => {
    try {
      const res = await alertApi.list();
      setAlerts(res.data?.alerts || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !targetPrice) return;
    setCreating(true);
    setError('');
    try {
      await alertApi.create({ product_url: url.trim(), target_price: parseFloat(targetPrice) });
      setUrl('');
      setTargetPrice('');
      fetchAlerts();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create alert');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await alertApi.delete(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-display-lg text-primary mb-2">Price Alerts</h1>
        <p className="text-on-surface-variant text-body-md max-w-2xl">
          Set up price drop alerts to never miss a deal. We'll notify you when the price reaches your target.
        </p>
      </div>

      {/* Create Alert Card */}
      <div className="card p-8 mb-12">
        <h2 className="font-display text-data-lg text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">add_alert</span>
          New Price Alert
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow flex items-center bg-white/20 rounded-lg border border-white/30 px-4 focus-within:ring-2 focus-within:ring-secondary transition-all backdrop-blur-md">
            <span className="material-symbols-outlined text-outline text-[20px]">link</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Product URL (Amazon, Flipkart...)"
              className="w-full py-3.5 px-3 border-none bg-transparent focus:ring-0 focus:outline-none font-sans text-body-md text-on-surface placeholder-outline"
            />
          </div>
          <div className="flex items-center bg-white/20 rounded-lg border border-white/30 px-4 focus-within:ring-2 focus-within:ring-secondary transition-all w-full md:w-48 backdrop-blur-md">
            <span className="text-outline font-bold">₹</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Target price"
              className="w-full py-3.5 px-3 border-none bg-transparent focus:ring-0 focus:outline-none font-sans text-body-md text-on-surface placeholder-outline"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !url.trim() || !targetPrice}
            className="btn-primary px-8 py-3.5"
          >
            {creating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Alert
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              </>
            )}
          </button>
        </form>
        {error && (
          <p className="mt-3 text-body-sm text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </p>
        )}
      </div>

      {/* Alerts List */}
      <h2 className="font-display text-headline-lg text-on-background mb-6">Active Alerts</h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 flex items-center gap-6">
              <div className="w-12 h-12 shimmer-bg rounded-full" />
              <div className="flex-grow space-y-2">
                <div className="h-5 shimmer-bg rounded w-2/3" />
                <div className="h-4 shimmer-bg rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-md">
            <span className="material-symbols-outlined text-[32px] text-outline">notifications_off</span>
          </div>
          <h3 className="font-display text-data-lg text-primary mb-2">No Alerts</h3>
          <p className="text-body-sm text-on-surface-variant">
            Create your first price alert above to get notified when prices drop.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="card p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-card-hover transition-shadow">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                alert.triggered ? 'bg-secondary-container' : 'bg-white/20 border border-white/30 backdrop-blur-md'
              }`}>
                <span className={`material-symbols-outlined ${alert.triggered ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
                  {alert.triggered ? 'notifications_active' : 'notifications'}
                </span>
              </div>

              {/* Content */}
              <div className="flex-grow min-w-0">
                <p className="text-body-sm text-on-surface font-medium truncate mb-1">
                  {alert.product_url}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-label-mono text-label-mono text-outline uppercase">{alert.platform}</span>
                  {alert.current_price !== null && (
                    <span className="text-body-sm text-on-surface-variant">
                      Current: <span className="font-bold text-primary">₹{alert.current_price?.toLocaleString()}</span>
                    </span>
                  )}
                  <span className="text-body-sm text-on-surface-variant">
                    Target: <span className="font-bold text-secondary">₹{alert.target_price?.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {alert.triggered ? (
                  <span className="badge-verified">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    TRIGGERED
                  </span>
                ) : (
                  <span className="badge bg-surface-container text-on-surface-variant">WATCHING</span>
                )}
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                  title="Delete alert"
                >
                  <span className="material-symbols-outlined text-error text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
