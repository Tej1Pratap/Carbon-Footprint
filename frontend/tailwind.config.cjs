/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',
        secondary: '#22c55e',
        accent: '#0ea5e9',
        warning: '#f59e0b',
        danger: '#ef4444',
        success: '#22c55e',
      },
      boxShadow: {
        'sm': '0 6px 12px -2px rgba(0, 0, 0, 0.12), 0 3px 6px -2px rgba(0, 0, 0, 0.08)',
        'md': '0 12px 20px -4px rgba(0, 0, 0, 0.15), 0 6px 8px -3px rgba(0, 0, 0, 0.1)',
        'DEFAULT': '0 12px 20px -4px rgba(0, 0, 0, 0.15), 0 6px 8px -3px rgba(0, 0, 0, 0.1)',
        'lg': '0 20px 30px -5px rgba(0, 0, 0, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
