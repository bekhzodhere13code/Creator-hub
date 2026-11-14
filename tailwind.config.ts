import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#3A14FF",
          50: "#EFEBFF",
          100: "#E2DBFF",
          600: "#3A14FF",
          700: "#2E0FD6",
        },
        ink: { DEFAULT: "rgb(var(--ink) / <alpha-value>)", soft: "rgb(var(--ink-soft) / <alpha-value>)" },
        surface: "rgb(var(--surface) / <alpha-value>)",
        peach: "#FFD3C2",
        sky: "#C9D9FF",
        mint: "#CDEFC8",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
export default config;
