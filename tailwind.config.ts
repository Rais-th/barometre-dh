import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f1ff",
          100: "#ebe4ff",
          200: "#d9ccff",
          300: "#bca5ff",
          400: "#9b75ff",
          500: "#7c4dff",
          600: "#6a32f5",
          700: "#5a21d8",
          800: "#4a1caf",
          900: "#3f1c8f",
          950: "#270e5f",
        },
        sand: {
          50: "#fbf9f5",
          100: "#f4eee2",
          200: "#e8dcc0",
          300: "#d8c397",
          400: "#c5a366",
          500: "#b38847",
          600: "#8f6a37",
          700: "#6d502e",
          800: "#4b3821",
          900: "#2f2414",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
