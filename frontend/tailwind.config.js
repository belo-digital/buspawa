/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(180, 67%, 24%)',
          hover: 'hsl(180, 67%, 20%)',
          light: 'hsl(180, 67%, 92%)',
        },
        border: 'hsl(180, 10%, 90%)',
        input: 'hsl(180, 10%, 90%)',
        ring: 'hsl(180, 67%, 24%)',
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(180, 10%, 10%)',
        muted: {
          DEFAULT: 'hsl(180, 10%, 96%)',
          foreground: 'hsl(180, 8%, 40%)',
        },
        success: {
          DEFAULT: 'hsl(142, 71%, 45%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 50%)',
        },
        danger: {
          DEFAULT: 'hsl(0, 84%, 60%)',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      fontFamily: {
        sans: ['Mandali', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
