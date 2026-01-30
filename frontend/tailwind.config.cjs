/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Mantendremos el soporte dark mode pero adaptado
  theme: {
    fontFamily: {
      display: ['Lato', 'sans-serif'],
      body: ['Lato', 'sans-serif'],
    },
    extend: {
      colors: {
        // Paleta UPTC
        uptc: {
          gold: '#FDB913',      // Amarillo Institucional
          goldHover: '#e0a200', // Un poco más oscuro para hover
          black: '#1A1A1A',     // Negro casi puro
          gray: '#4D4D4D',      // Gris texto
          light: '#F5F5F5',     // Fondo claro
        },
        // Mapeo a nombres semánticos
        primary: {
          DEFAULT: '#FDB913', // UPTC Gold
          50: '#fffbf0',
          100: '#fff5d6',
          200: '#ffe8ad',
          300: '#ffd675',
          400: '#ffc042',
          500: '#FDB913', // Base
          600: '#e39603',
          700: '#bd7102',
          800: '#995606',
          900: '#7e460b',
        },
        // El color secundario será el negro/gris oscuro institucional
        secondary: {
          DEFAULT: '#1A1A1A',
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4d4d4d',
          800: '#1A1A1A', // Base UPTC Black
          900: '#171717',
        }
      },
      backgroundImage: {
        'uptc-gradient': 'linear-gradient(to right, #FDB913, #F2A900)',
        'uptc-dark': 'linear-gradient(to right, #1A1A1A, #2C2C2C)',
      }
    },
  },
  plugins: [],
}