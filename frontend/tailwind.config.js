/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2933',
        paper: '#f7f5ef',
        moss: '#2f6f5e',
        marine: '#1f4f66',
        coral: '#d8664f',
        gold: '#c89b3c',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(31, 41, 51, 0.12)',
      },
    },
  },
  plugins: [],
};
