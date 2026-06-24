import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0E14",
        surface: "#11151F",
        border: "rgba(255,255,255,0.08)",
        indigo: {
          DEFAULT: "#6366F1",
          glow: "#818CF8",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          glow: "#67E8F9",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(99,102,241,0.45)",
        "glow-cyan": "0 0 40px -10px rgba(34,211,238,0.45)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
