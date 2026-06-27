import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white/10 backdrop-blur-md border-t border-outline-variant">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-gutter py-12 max-w-[1280px] mx-auto w-full gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-3 max-w-md">
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-brand-600 flex items-center justify-center text-white shadow-md shadow-secondary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                shopping_cart
              </span>
            </div>
            <span className="font-display text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-secondary to-brand-600 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              TrustCart
            </span>
          </Link>
          <p className="text-body-sm text-on-surface-variant">
            Empowering consumers through algorithmic verification and transparent pricing.
            We monitor 400+ retailers 24/7 to ensure your purchase is backed by truth.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-4">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-body-sm text-on-surface mb-2">Legal</span>
            <a href="#" className="text-body-sm text-on-surface-variant hover:text-primary transition-all">
              Terms of Service
            </a>
            <a href="#" className="text-body-sm text-on-surface-variant hover:text-primary transition-all">
              Privacy Policy
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold text-body-sm text-on-surface mb-2">Platform</span>
            <a href="#" className="text-body-sm text-on-surface-variant hover:text-primary transition-all">
              Data Transparency
            </a>
            <a href="#" className="text-body-sm text-on-surface-variant hover:text-primary transition-all">
              Methodology
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold text-body-sm text-on-surface mb-2">Support</span>
            <a href="#" className="text-body-sm text-on-surface-variant hover:text-primary transition-all">
              Contact Support
            </a>
            <a href="#" className="text-body-sm text-on-surface-variant hover:text-primary transition-all">
              Report Accuracy
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-outline-variant/50">
        <div className="max-w-[1280px] mx-auto px-gutter py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-outline">
            © {new Date().getFullYear()} TrustCart Precision Analytics. All data sources verified.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors text-[20px]">
              public
            </span>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors text-[20px]">
              monitoring
            </span>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors text-[20px]">
              security
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
