/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.12)",
        "glass-lg": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        neu: "8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.9)",
        "neu-inset":
          "inset 6px 6px 12px rgba(163, 177, 198, 0.45), inset -6px -6px 12px rgba(255, 255, 255, 0.85)",
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(236, 72, 153, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(56, 189, 248, 0.2) 0px, transparent 45%), linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
        "mesh-dark":
          "radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(236, 72, 153, 0.25) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(56, 189, 248, 0.2) 0px, transparent 45%), linear-gradient(180deg, #0f172a 0%, #020617 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
