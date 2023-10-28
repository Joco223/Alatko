/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      boxShadow: {
        orang: '3px 3px 0px 0px rgba(234, 88, 12, 1)',
        orangActive: '2px 2px 0px 0px rgba(234, 88, 12, 1)',
        orangWarning: '3px 3px 0px 0px rgba(172, 79, 15, 1)',
        orangWarningActive: '2px 2px 0px 0px rgba(172, 79, 15, 1)',
        green: '3px 3px 0px 0px rgba(110, 176, 80, 1)',
        greenActive: '2px 2px 0px 0px rgba(110, 176, 80, 1)',
      },
    },
  },
  plugins: [],
}