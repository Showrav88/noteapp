/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#211E3B',
          cyan: '#43BAFF',
          orange: '#FF3C00',
          muted: '#F8F8F8',
          ink: '#232323',
          border: '#E8E8EC',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(33, 30, 59, 0.06), 0 8px 24px rgba(33, 30, 59, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
