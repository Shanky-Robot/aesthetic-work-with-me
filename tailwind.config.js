/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
      },
      keyframes: {
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        rainFall: {
          "0%": { transform: "translateY(-10vh)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(110vh)", opacity: "0" },
        }
      },
      animation: {
        gradientShift: "gradientShift 15s ease infinite",
        rainFall: "rainFall 1s linear infinite",
      }
    },
  },
  plugins: [],
}
