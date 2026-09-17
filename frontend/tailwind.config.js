/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf8f3',
          100: '#f5efe4',
          200: '#ebdcc7',
          300: '#dec2a2',
          400: '#cca078',
          500: '#bc8357',
          600: '#aa6d49',
          700: '#8d553d',
          800: '#724635',
          900: '#5e3a2e',
        },
        hotel: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#c5a059',
          accentHover: '#b38f48',
          subtle: '#f8fafc',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
