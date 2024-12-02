/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors:{
        primary:'#014782',
        secondary:'#e5d000',

      }
    },
    placeholderColor: theme => theme('colors')
  },
  plugins: [],
}

