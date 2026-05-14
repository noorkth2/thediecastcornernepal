import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#C0392B",
          "red-light": "#E74C3C",
          gold: "#F5C518",
          orange: "#E67E22",
          green: "#1A6B3A",
        },
        surface: {
          base: "#111111",
          card: "#1E1E1E",
          elevated: "#2A2A2A",
          border: "#333333",
        },
        text: {
          primary: "#F5F5F5",
          muted: "#888888",
          faint: "#555555",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ['"Bebas Neue"', "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
        "speed-line": "speedLine 0.6s ease-out forwards",
        marquee: "marquee 25s linear infinite",
        "float-up": "floatUp 0.4s ease-out forwards",
        "cart-bounce": "cartBounce 0.4s ease",
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        speedLine: {
          "0%": { transform: "translateX(-110%)", opacity: "1" },
          "100%": { transform: "translateX(110%)", opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floatUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        cartBounce: {
          "0%, 100%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.4)" },
          "60%": { transform: "scale(0.9)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(192,57,43,0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(192,57,43,0.8)" },
        },
      },
      backgroundImage: {
        "card-gradient": "linear-gradient(135deg, #1E1E1E 0%, #2A2A2A 100%)",
        "hero-gradient":
          "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0505 100%)",
        "brand-gradient": "linear-gradient(90deg, #C0392B, #E67E22, #F5C518)",
      },
    },
  },
  plugins: [],
};
export default config;
