import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060913",
        surface: {
          50: "#0b1120",
          100: "#0f172a",
          200: "#131f37",
          300: "#1e293b",
          400: "#334155",
        },
        brand: {
          cyan: "#00f2fe",
          blue: "#4facfe",
          purple: "#7c3aed",
          emerald: "#10b981",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(0, 242, 254, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(79, 172, 254, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
