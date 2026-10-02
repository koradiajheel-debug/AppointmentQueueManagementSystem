/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F4C5C',
          dark: '#0e3933',
          deep: '#0a2723',
        },
        forest: {
          50: '#f0fdf7',
          100: '#dcfce9',
          500: '#10b981',
          700: '#15803d',
          800: '#0e382c',
          900: '#0e3933',
          950: '#0a221d',
        },
        sage: {
          100: '#eef6f1',
          200: '#d5e9dc',
          500: '#6B9E7A',
          600: '#528361',
        },
        alabaster: '#F7F7F5',
        chalk: '#fbfbf9',
        charcoal: '#1F2937',
      },
      fontFamily: {
        serif: ['Newsreader', 'Lora', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
