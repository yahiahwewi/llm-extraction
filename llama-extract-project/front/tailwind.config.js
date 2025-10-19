/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      keyframes: {
        cursor: { '0%, 50%': { opacity: 1 }, '50.01%, 100%': { opacity: 0 } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'gradient-x': { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        slideDown: { '0%': { opacity: 0, transform: 'translateY(-10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        cursor: 'cursor 1s infinite',
        float: 'float 4s ease-in-out infinite',
        gradient: 'gradient-x 5s ease infinite',
        'pulse-slow': 'pulse 6s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out',
        'slide-down': 'slideDown 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
