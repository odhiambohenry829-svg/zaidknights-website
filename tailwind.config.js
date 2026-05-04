/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0B0B0B',
          white: '#FFFFFF',
          gold: '#D4AF37',
          forest: '#0F3D2E'
        }
      },
      boxShadow: {
        glass: '0 10px 40px rgba(0, 0, 0, 0.15)'
      }
    }
  },
  plugins: []
};
