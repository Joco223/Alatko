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
        orangHover: '4px 4px 0px 0px rgba(234, 88, 12, 1)',
        orangActive: '2px 2px 0px 0px rgba(249, 115, 22, 1)',
      },
    },
  },
  plugins: [],
}