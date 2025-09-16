// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",                               // optional dark mode
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        primary:  "#2ECC71",
        surface:  "#FFFFFF",
        surface2: "#F6F8FA",
        outline:  "#E5E7EB",
        danger:   "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      dropShadow: {
        card: "0 1px 3px rgba(0,0,0,.07)",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // ← scanne tout le code
  ],
  theme: { extend: {} },
  plugins: [],
};
