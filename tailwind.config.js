/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdfbf7',
          100: '#faedd7',
          200: '#f5d9ad',
          300: '#edbf7d',
          400: '#e5a550',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
          deep: '#1e1b18',
          card: '#2a2621'
        },
        km: {
          charcoal: '#1c1917',
          amber: '#b45309',
          gold: '#d97706',
          cream: '#fdfcf9',
          warmgray: '#f5efe6',
          border: '#e7d8c5'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Sans"', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
