/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#B91C1C',
          'red-dark': '#8E1414',
          'red-deep': '#6E0F0F',
          cream: '#FBF3E4',
          'cream-2': '#F8EFD8',
          ink: '#1A1A1A',
          'ink-2': '#2A2421',
          gold: '#C8964B',
          salmon: '#C97E67',
          'grey-sub': '#9B9B9B',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'sans-cn': [
          '"PingFang TC"',
          '"Noto Sans TC"',
          '"Microsoft JhengHei"',
          '"Inter"',
          'sans-serif',
        ],
      },
      letterSpacing: {
        'eyebrow': '0.22em',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
};
