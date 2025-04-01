/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./web-build/**/*.html"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#ffffff',
          dark: '#1a1a1a'
        },
        secondary: {
          light: '#2563eb',
          dark: '#4a9eff'
        },
        text: {
          light: '#000000',
          dark: '#ffffff'
        },
        background: {
          light: '#f3f4f6',
          dark: '#161622'
        },
        surface: {
          light: '#ffffff',
          dark: '#2a2a2a'
        },
        border: {
          light: '#e5e7eb',
          dark: '#4a5568'
        },
        error: {
          light: '#dc2626',
          dark: '#ef4444'
        }
      },
      fontFamily: {
        'ezra': ['"Ezra SIL SR"', 'serif'],
        'guttman': ['"Guttman Keren"', 'sans-serif'],
        'david': ['David', 'sans-serif'],
        'davidbd': ['DavidBD', 'sans-serif'],
      }
    }
  },
  plugins: []
};
