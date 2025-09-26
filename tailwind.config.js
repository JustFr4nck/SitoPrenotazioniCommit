/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./.nuxt/**/*.{js,vue,ts}" // aggiunto per compatibilità Nuxt
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
