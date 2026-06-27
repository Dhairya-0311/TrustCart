import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'History', path: '/history' },
  { label: 'Alerts', path: '/alerts' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="glass-header border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 w-full">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-brand-600 flex items-center justify-center text-white shadow-md shadow-secondary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_20px_rgba(0,106,97,0.5)]">
              <span className="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>
                shopping_cart
              </span>
            </div>
            <span className="font-display text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-secondary to-brand-600 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              TrustCart
            </span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`font-sans text-body-md transition-colors cursor-pointer ${
                      isActive
                        ? 'text-primary font-bold border-b-2 border-primary pb-1'
                        : 'text-on-surface-variant hover:text-secondary'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {/* Search */}
              <div className="hidden sm:flex items-center bg-surface-container border border-outline-variant rounded-xl px-5 py-3 shadow-sm hover:shadow-[0_0_15px_rgba(0,106,97,0.15)] focus-within:shadow-[0_0_20px_rgba(0,106,97,0.3)] focus-within:border-secondary transition-all duration-300 group/search">
                <span className="material-symbols-outlined text-outline text-[26px] transition-all duration-300 group-hover/search:scale-125 group-hover/search:text-primary group-hover/search:drop-shadow-[0_0_8px_rgba(0,106,97,0.6)] cursor-pointer">search</span>
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="bg-transparent border-none focus:ring-0 focus:outline-none text-body-md w-64 lg:w-[600px] ml-3 text-on-surface placeholder-outline font-medium"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-[30px]">notifications</span>
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-[30px]">account_circle</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-outline-variant rounded-xl shadow-elevated py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-5 py-3 border-b border-outline-variant">
                    <p className="text-body-md font-bold text-on-surface truncate">{user?.name || user?.email}</p>
                    <p className="text-label-mono text-outline">{user?.plan} Plan</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-5 py-3 text-body-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/history"
                    className="block px-5 py-3 text-body-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                  >
                    History
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-5 py-3 text-body-md text-error hover:bg-error-container transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/auth"
                className="text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="btn-primary text-sm px-5 py-2"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
