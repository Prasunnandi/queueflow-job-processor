/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        devops: {
          50: '#f0fdfa',
          900: '#134e4a',
          950: '#042f2e',
        }
      }
    },
  },
  plugins: [],
}