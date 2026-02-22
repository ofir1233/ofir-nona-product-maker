import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#000000",
        surface: "#0a0a0a",
        "surface-2": "#111111",
        accent: "#4fffb0",
        "accent-blue": "#4fc3ff",
        "text-primary": "#e8e8e8",
        muted: "#404040",
        "muted-2": "#2a2a2a",
      },
      fontFamily: {
        mono: ["var(--font-jetbrains)", "monospace"],
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "fade-in": "fadeIn 0.8s ease forwards",
        "slide-up": "slideUp 0.6s ease forwards",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
