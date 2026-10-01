/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f8',
          100: '#d7e0ee',
          200: '#aec1dd',
          300: '#7f9cc6',
          400: '#4f75ab',
          500: '#2f5590',
          600: '#1d3f74',
          700: '#152f5c',
          800: '#0f2347',
          900: '#0a1a36',
          950: '#071227',
        },
        gold: {
          50: '#fef9ec',
          100: '#fdefc7',
          200: '#fbdd8a',
          300: '#f9c74d',
          400: '#f7b733',
          500: '#f0a020',
          600: '#d9821a',
          700: '#b46318',
          800: '#924e1b',
          900: '#78411b',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 35, 71, 0.06), 0 4px 16px rgba(15, 35, 71, 0.06)',
      },
    },
  },
  plugins: [],
}
