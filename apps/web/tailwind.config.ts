import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#08090b',
        card: '#0f1115',
        'card-border': 'rgba(255, 255, 255, 0.08)',
        muted: '#181b20',
        'muted-foreground': '#8a8f98',
        brand: {
          50: '#eefdf4',
          100: '#d7fae3',
          200: '#b1f4ca',
          300: '#75eaab',
          400: '#34d485',
          500: '#10b969',
          600: '#059652',
          700: '#047743',
          800: '#075e37',
          900: '#074e2f',
          950: '#032b1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
