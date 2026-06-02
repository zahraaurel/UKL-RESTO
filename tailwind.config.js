/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0A08',     // Hitam pekat latar belakang
          gold: '#C5A880',     // Emas utama untuk teks & tombol aktif
          goldDim: '#8A7558',  // Emas redup untuk sub-detail
          cardBg: '#12110E',   // Background border/card tipis (opsional)
        }
      },
    },
  },
  plugins: [],
};