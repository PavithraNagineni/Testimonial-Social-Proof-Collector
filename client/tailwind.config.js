/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0d1b17',
          900: '#122622',
          800: '#1a352f',
          700: '#234a41',
          600: '#2e6156',
          500: '#3b7c6d',
        },
        paper: {
          50: '#fbf9f3',
          100: '#f5f1e6',
          200: '#ece4d1',
        },
        clay: {
          400: '#e0a458',
          500: '#d18a3a',
          600: '#b06f2a',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(13,27,23,0.06), 0 6px 20px rgba(13,27,23,0.06)',
      },
    },
  },
  plugins: [],
};
