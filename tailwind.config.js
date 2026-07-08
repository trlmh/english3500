/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF7',
        surface: '#FFFFFF',
        text: '#1A1A2E',
        muted: '#6B7280',
        accent: {
          DEFAULT: '#4F8C6C',
          light: '#6BA587',
          dark: '#3D6B52',
        },
        success: '#34D399',
        error: '#F87171',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
