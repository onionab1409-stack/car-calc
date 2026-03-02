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
          app: '#2a2b2a',
          raised: '#313231',
          card: '#353534',
          'card-hi': '#3d3d3c',
          input: '#262726',
          overlay: '#222322',
        },
        gold: {
          50:  '#fff4d4',
          100: '#ffe9a1',
          200: '#d9a54e',
          300: '#c99a48',
          400: '#b8933f',
          500: '#a68540',
          600: '#8a7344',
          700: '#6b5a3e',
          800: '#4d4132',
          900: '#3a3028',
        },
        neutral: {
          50:  '#e8dcc4',
          100: '#d4b87a',
          200: '#a09480',
          300: '#7a7068',
          400: '#5a524a',
          500: '#4d4842',
          600: '#3e3a36',
          700: '#333130',
          800: '#2a2928',
          900: '#222120',
        },
        success: '#4ADE80',
        error:   '#e8725a',
        warning: '#d9a54e',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xs: '6px', sm: '8px', md: '12px', lg: '16px', xl: '20px',
      },
      animation: {
        'fade-in':    'fadeIn 400ms ease-out',
        'slide-up':   'slideUp 400ms ease-out',
        'count-up':   'countUp 1.2s ease-out',
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'floatUp 3s ease-in-out infinite',
        'spin-slow':  'spin 1.2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
