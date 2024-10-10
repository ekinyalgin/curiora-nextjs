/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          background: '#f9fafb', // Açık gri tonunda arka plan rengi
          foreground: '#111827', // Koyu gri tonunda yazı rengi
          primary: '#3b82f6', // Mavi tonunda ana renk
          secondary: '#ef4444', // Kırmızı tonunda vurgu rengi
          accent: '#10b981', // Yeşil tonunda vurgu
          muted: '#6b7280', // Nötr metinler için
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'], // Modern bir sans-serif fontu
        },
      },
    },
    plugins: [],
  };
  