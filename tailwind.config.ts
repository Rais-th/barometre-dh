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
        // Brand palette centered on #d9effe (the user-specified base).
        // Designed for a GBV reporting platform — calm, institutional, trustworthy.
        brand: {
          50: "#f4fafe",
          100: "#e8f4fe",
          200: "#d9effe",
          300: "#b8e0fd",
          400: "#8ac7f9",
          500: "#5aabf2",
          600: "#2d88d9",
          700: "#1a66b3",
          800: "#184a83",
          900: "#163b66",
          950: "#0c2240",
        },
        // Neutral "paper" — warm off-white + inky text. Replaces the old sand scale.
        sand: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e7e7ea",
          300: "#d3d3d7",
          400: "#a3a3a8",
          500: "#737378",
          600: "#525258",
          700: "#3f3f44",
          800: "#262629",
          900: "#17171a",
        },
        ink: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e7e7ea",
          300: "#d3d3d7",
          400: "#a3a3a8",
          500: "#737378",
          600: "#525258",
          700: "#3f3f44",
          800: "#262629",
          900: "#17171a",
        },
        paper: "#fbfcfe",
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
        display: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.035em",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
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
