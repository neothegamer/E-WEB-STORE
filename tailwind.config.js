const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        surface2: c('surface-2'),
        fg: c('fg'),
        muted: c('muted'),
        border: c('border'),
        accent: c('accent'),
        'accent-fg': c('accent-fg'),
        ok: c('ok'),
        warn: c('warn'),
        bad: c('bad'),
      },
      borderRadius: { card: 'var(--radius-card)', btn: 'var(--radius-btn)', pill: 'var(--radius-pill)' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], heading: 'var(--font-heading)' },
    },
  },
  plugins: [],
};
