/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ──────────────────────────────────────────────────────────
      // ★  Mahfuz এর Color Palette — এখানে রং পরিবর্তন করুন  ★
      // ──────────────────────────────────────────────────────────
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',   // ← Primary (main button/active)
          700: '#1d4ed8',   // ← Hover
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sidebar: {
          bg:     '#111827',  // ← Sidebar background
          hover:  '#1f2937',  // ← Menu item hover
          active: '#2563eb',  // ← Active menu item
          border: '#1f2937',  // ← Divider/border
          text:   '#9ca3af',  // ← Menu text (inactive)
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}