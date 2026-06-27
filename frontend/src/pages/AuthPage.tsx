import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
      navigate('/dashboard');
    } catch (err: any) {
      const responseData = err?.response?.data;
      let errMsg = responseData?.error || 'Something went wrong';
      if (responseData?.details && Array.isArray(responseData.details)) {
        const detailMsgs = responseData.details.map((d: any) => d.message).join(', ');
        if (detailMsgs) {
          errMsg = `${detailMsgs}`;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-gutter py-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container mb-6">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
            <span className="font-label-mono text-label-mono uppercase tracking-widest">Secure Access</span>
          </div>
          <h1 className="font-display text-headline-lg text-on-background mb-3">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-on-surface-variant text-body-md">
            {isLogin
              ? 'Sign in to access your verification dashboard'
              : 'Start verifying products with algorithmic precision'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8 shadow-card">
          {/* Tab Toggle */}
          <div className="flex bg-white/20 rounded-lg p-1 mb-8 border border-white/20 backdrop-blur-md">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-md text-body-sm font-medium transition-all ${
                isLogin
                  ? 'bg-white/40 text-primary shadow-sm font-bold border border-white/20 backdrop-blur-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-md text-body-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-white/40 text-primary shadow-sm font-bold border border-white/20 backdrop-blur-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error-container border border-error/20 flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-[20px]">error</span>
              <span className="text-body-sm text-on-error-container">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-body-sm font-medium text-on-surface mb-2">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-2">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-2">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-bold text-body-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom link */}
          <p className="mt-6 text-center text-body-sm text-on-surface-variant">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-secondary font-bold hover:underline"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex justify-center gap-8 text-outline">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span className="text-label-mono">256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="text-label-mono">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
