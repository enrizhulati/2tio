import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 2TurnItOn Brand Colors
        coral: {
          DEFAULT: '#FF6F61',
          hover: '#E85A4F',
          light: '#FFF0EE',
        },
        teal: {
          DEFAULT: '#20C997',
          hover: '#1DB88A',
          light: '#E6F9F3',
        },
        // Neutrals
        darkest: '#343A40',
        dark: '#6C757D',
        medium: '#ADB5BD',
        light: '#DEE2E6',
        lightest: '#F8F9FA',
        // Semantic
        success: {
          DEFAULT: '#2F9E44',
          light: '#E8F5EC',
        },
        error: {
          DEFAULT: '#C92A2A',
          light: '#FAEBEB',
        },
        warning: {
          DEFAULT: '#E67700',
          light: '#FFF8E6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        h1: ['44px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        h2: ['35px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' }],
        h3: ['28px', { lineHeight: '1.25', fontWeight: '700' }],
        h4: ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['18px', { lineHeight: '1.5' }],
        small: ['16px', { lineHeight: '1.5' }],
        tiny: ['14px', { lineHeight: '1.5' }],
      },
      spacing: {
        xs: '8px',
        s: '16px',
        m: '24px',
        l: '32px',
        xl: '48px',
        xxl: '80px',
      },
      borderRadius: {
        s: '4px',
        m: '8px',
        l: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(52, 58, 64, 0.05)',
        md: '0 4px 6px rgba(52, 58, 64, 0.07)',
        lg: '0 10px 15px rgba(52, 58, 64, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
