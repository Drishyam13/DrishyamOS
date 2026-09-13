/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07090E',
          900: '#0B0F17',
          850: '#111723',
          800: '#172033',
          700: '#233047',
          600: '#344666',
        },
        brand: {
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        alert: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#F59E0B',
          low: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(37, 99, 235, 0.25)',
        alert: '0 0 25px rgba(239, 68, 68, 0.35)',
      },
    },
  },
  plugins: [],
};
