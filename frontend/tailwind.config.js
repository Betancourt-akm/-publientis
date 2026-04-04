/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  
  ],
    theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        heading: ['Poppins', ...fontFamily.sans],
      },
      colors: {
        primary: '#F8F9FA',      // Light Gray (Almost White)
        secondary: '#FFFFFF',   // White
        accent: {
          DEFAULT: '#E53E3E', // Red
          hover: '#C53030',   // Darker Red
        },
        text: {
          primary: '#111827',   // Soft Black
          secondary: '#6B7280', // Medium Gray
          disabled: '#D1D5DB',  // Light Gray
        },
        status: {
          success: '#10B981', // Green
          error: '#EF4444',   // Red
          warning: '#F59E0B', // Amber
        },
      },
    },
  },
  plugins: [],
  
}

