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
        background: "#eaf2d7", // Base background: Tea Green / Celadon
        foreground: "#22121b", // Deep plum charcoal for ultra-crisp readable typography
        // Coolors Palette: https://coolors.co/palette/e27396-ea9ab2-efcfe3-eaf2d7-b3dee2
        palette: {
          mauve: "#e27396",    // China Rose / Deep Magenta Rose (Primary Action & Accent)
          rose: "#ea9ab2",     // Tuscany Soft Rose (Secondary Accent & Badges)
          thistle: "#efcfe3",  // Pale Lilac Thistle (Card Border & Accents)
          teagreen: "#eaf2d7", // Tea Green / Soft Celadon (Main Page Background)
          iceblue: "#b3dee2",  // Powder Ice Blue (Trust Indicators & Feature Panels)
          deep: "#22121b",     // Deep Plum Typography (WCAG AAA contrast against teagreen)
          muted: "#5a3045",    // Muted Rose Plum Subtext
          darkmauve: "#b8476d",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        mauve: "0 10px 30px -5px rgba(226, 115, 150, 0.2)",
        "mauve-lg": "0 20px 40px -10px rgba(226, 115, 150, 0.3)",
        card: "0 4px 20px -2px rgba(90, 48, 69, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
