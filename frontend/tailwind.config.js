/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#006d5b', // Vert émeraude marocain sombre
        secondary: '#6050dc', // Bleu Majorelle
        'accent-gold': '#b8860b', // Or foncé / Bronze
        terracotta: '#c04000', // Terre cuite marocaine
        'background-light': '#fdfbf7',
        'background-dark': '#1a1c1a',
        parchment: '#f5f2e8', // Vieux papier parchemin
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
