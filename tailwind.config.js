/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#073b4c', sea: '#0e7490', saffron: '#f59e0b', mist: '#f5f8f7' },
      boxShadow: { soft: '0 14px 45px rgba(7, 59, 76, 0.10)' },
    },
  },
  plugins: [],
}
