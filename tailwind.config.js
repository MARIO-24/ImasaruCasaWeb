/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FDFBF7',
          100: '#F7F2EA',
          200: '#EFE6D8',
          300: '#E3D2BC',
          400: '#CDB699',
        },
        timber: {
          950: '#1C130D',
          900: '#2A1D15',
          800: '#3D2A1F',
          700: '#563D2E',
          600: '#755440',
          500: '#946E56',
        },
        atlantic: {
          950: '#0C1820',
          900: '#152836',
          800: '#1E3A4E',
          700: '#2C516D',
          600: '#3C6D91',
        },
        terracotta: {
          700: '#9E442B',
          600: '#B85336',
          500: '#CC6649',
          400: '#DD8267',
        },
        olive: {
          900: '#233027',
          800: '#324538',
          700: '#445D4C',
          600: '#5A7A64',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

