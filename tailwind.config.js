/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#020617",
        deep: "#080e1a",
        slate: { 850: "#0f172a" },
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Noto Sans JP"', 'sans-serif'],
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease both",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
