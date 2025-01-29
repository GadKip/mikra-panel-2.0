/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',    // Dark background
        secondary: '#4a9eff',  // Blue accent color
        text: '#ffffff',       // White text
        'gray': {
          600: '#666666',      // Inactive tab color
          700: '#2a2a2a',      // Secondary background
          800: '#1f1f1f',
        }
      }
    }
  },
  plugins: []
}
