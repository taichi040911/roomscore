/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#050A18",
        deep: "#0A1628",
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Noto Sans JP"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease both",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
