import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app:      '#0C0C0E',
          elevated: '#111114',
          card:     '#141418',
          'card-hover': '#1A1A1E',
          input:    '#141413',
        },
        gold: {
          50:  '#FFE2A9',
          100: '#FDDDA5',
          200: '#F1C080',
          300: '#D4B876',
          400: '#C4A265',
          500: '#A08050',
          600: '#83582E',
          700: '#634023',
          800: '#4B3423',
          900: '#2D1C13',
        },
        neutral: {
          50:  '#F0EDE5',
          100: '#E0DCD4',
          200: '#D4C8A8',
          300: '#B0A898',
          400: '#8A8478',
          500: '#6A665E',
          600: '#5A5650',
          700: '#4A4844',
          800: '#3A3836',
          900: '#2A2826',
        },
        success: '#4ADE80',
        error:   '#F87171',
        warning: '#FBBF24',
        info:    '#8B9DAF',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      fontSize: {
        'price-xl': ['48px', { lineHeight: '1.0', fontWeight: '400' }],
        'display':  ['32px', { lineHeight: '1.15', fontWeight: '500' }],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        gold:       '0 4px 20px rgba(196,162,101,0.15)',
        'gold-lg':  '0 6px 28px rgba(196,162,101,0.25)',
        'gold-glow':'0 0 40px rgba(196,162,101,0.12)',
      },
      animation: {
        'fade-in':    'fadeIn 400ms ease-out',
        'slide-up':   'slideUp 400ms ease-out',
        'count-up':   'countUp 1.2s ease-out',
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          '0%':  { opacity: '0', transform: 'scale(0.8)' },
          '60%': { opacity: '1', transform: 'scale(1.02)' },
          '100%':{ transform: 'scale(1)' },
        },
        goldPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
