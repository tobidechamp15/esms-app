/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Ventry brand colours extracted from the Figma UI
        primary: {
          DEFAULT: '#1B4FD8',
          50:  '#EEF2FF',
          100: '#D8E2FB',
          200: '#B1C4F7',
          300: '#7EA2F2',
          400: '#4B7AEB',
          500: '#1B4FD8',
          600: '#1540B8',
          700: '#103298',
          800: '#0B2478',
          900: '#071858',
        },
        navy: {
          DEFAULT: '#0A1628',
          light: '#0F2040',
        },
        surface: '#F5F6FA',
        border:  '#E8E9EE',
        // Status colours matching the UI badges
        success: '#16A34A',
        warning: '#D97706',
        danger:  '#DC2626',
        muted:   '#6B7280',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
