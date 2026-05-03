/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Grey Palette
        'deepest-dark': '#0a0a0a',
        'dark-grey-1': '#111111',
        'dark-grey-2': '#1a1a1a',
        'dark-grey-3': '#2a2a2a',
        'mid-grey': '#404040',
        'light-grey-1': '#666666',
        'light-grey-2': '#a3a3a3',
        'light-grey-3': '#d4d4d4',
        'light-grey-4': '#e5e5e5',
        'almost-white': '#f5f5f5',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Mono', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'marquee': 'marquee 28s linear infinite',
        'blink': 'blink 1.1s step-end infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        blink: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } },
        pulseDot: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      }
    }
  },
  plugins: []
}
