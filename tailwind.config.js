/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff3333',
          dark: '#cc0000',
        },
        secondary: {
          DEFAULT: '#1a1a1a',
          light: '#2a2a2a',
        },
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};