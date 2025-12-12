import { heroui } from "@heroui/react";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5ea',
          100: '#d1ebe3',
          500: '#15a55a',
          600: '#12934e',
          700: '#0f7a42',
        },
        muted: {
          100: '#f3f4f6',
          500: '#6b7280',
          600: '#4b5563',
        },
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '16px',
        '4': '24px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 6px 12px rgba(18, 147, 78, 0.12)',
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
      },
      zIndex: {
        'tooltip': '1000',
      },
    },
  },
  plugins: [heroui()],
};
