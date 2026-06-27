/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Stitch Design System (Material 3 Tokens) ──
        'primary': '#000000',
        'on-primary': '#ffffff',
        'primary-container': '#131b2e',
        'on-primary-container': '#7c839b',
        'primary-fixed': '#dae2fd',
        'primary-fixed-dim': '#bec6e0',
        'on-primary-fixed': '#131b2e',
        'on-primary-fixed-variant': '#3f465c',
        'inverse-primary': '#bec6e0',

        'secondary': '#006a61',
        'on-secondary': '#ffffff',
        'secondary-container': '#86f2e4',
        'on-secondary-container': '#006f66',
        'secondary-fixed': '#89f5e7',
        'secondary-fixed-dim': '#6bd8cb',
        'on-secondary-fixed': '#00201d',
        'on-secondary-fixed-variant': '#005049',

        'tertiary': '#000000',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#001a42',
        'on-tertiary-container': '#3980f4',
        'tertiary-fixed': '#d8e2ff',
        'tertiary-fixed-dim': '#adc6ff',
        'on-tertiary-fixed': '#001a42',
        'on-tertiary-fixed-variant': '#004395',

        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        'surface': '#f8f9ff',
        'on-surface': '#0b1c30',
        'surface-dim': '#cbdbf5',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'surface-variant': '#d3e4fe',
        'on-surface-variant': '#45464d',
        'surface-tint': '#565e74',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',

        'outline': '#76777d',
        'outline-variant': '#c6c6cd',

        'background': '#f8f9ff',
        'on-background': '#0b1c30',

        // ── Semantic / Legacy ──
        brand: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#4263eb',
          800: '#3b5bdb',
          900: '#364fc7',
        },
        trust: {
          high: '#10b981',
          medium: '#f59e0b',
          low: '#ef4444',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Geist', 'system-ui', 'sans-serif'],
        'mono': ['Geist', 'JetBrains Mono', 'monospace'],
        // Stitch design system font families
        'display-lg': ['Geist'],
        'headline-lg': ['Geist'],
        'headline-lg-mobile': ['Geist'],
        'data-lg': ['Geist'],
        'label-mono': ['Geist'],
        'body-md': ['Inter'],
        'body-sm': ['Inter'],
      },
      fontSize: {
        'display-lg': ['64px', { lineHeight: '72px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['44px', { lineHeight: '52px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'data-lg': ['26px', { lineHeight: '34px', fontWeight: '600' }],
        'body-md': ['20px', { lineHeight: '30px', fontWeight: '400' }],
        'body-sm': ['18px', { lineHeight: '26px', fontWeight: '400' }],
        'label-mono': ['15px', { lineHeight: '22px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      spacing: {
        'base': '8px',
        'gutter': '24px',
        'container-max': '1280px',
        'margin-mobile': '16px',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0px 4px 20px rgba(15, 23, 42, 0.04)',
        'card-hover': '0px 10px 30px rgba(15, 23, 42, 0.08)',
        'elevated': '0px 8px 40px rgba(15, 23, 42, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'gauge-fill': 'gaugeFill 1.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 106, 97, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 106, 97, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gaugeFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--gauge-offset)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
