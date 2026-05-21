import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D946EF',    // Fuchsia
        accent: '#22D3EE',     // Cyan
        tertiary: '#FACC15',   // Yellow
        danger: '#EF4444',     // Red
        warning: '#F59E0B',    // Amber
        success: '#22C55E',    // Green
        backgroundApp: '#09090b',
        cardApp: '#121214',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
