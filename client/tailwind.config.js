module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',   // ← Important for dark mode
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        danger: '#EF4444',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}