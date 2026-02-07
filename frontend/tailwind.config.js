/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1152d4',
        'accent-gold': '#d4af37',
        'background-light': '#ffffff',
        'background-dark': '#0a0f18',
        parchment: '#fdfbf7',
        'emerald-deep': '#064e3b',
        'admin-primary': '#13ec5b',
        'admin-bg': '#f6f8f6',
      },
      fontFamily: {
        display: ['Public Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
