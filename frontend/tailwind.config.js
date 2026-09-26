/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0756B8',
          hover: '#054496',
          light: '#EAF4FF',
          dark: '#053C80',
        },
        navy: {
          DEFAULT: '#062B5C',
          light: '#0A3B7B',
          deep: '#061B36',
        },
        surface: {
          hero: '#F5FAFF',
          muted: '#F8FAFC',
          card: '#FFFFFF',
        },
        text: {
          main: '#111827',
          muted: '#64748B',
          light: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          light: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(7, 86, 184, 0.1), 0 8px 10px -6px rgba(7, 86, 184, 0.05)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
