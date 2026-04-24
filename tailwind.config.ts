/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0b0f",
        bg2: "#0f1118",
        bg3: "#151822",
        border: "#1e2230",
        gold: "#c8a96e",
        emerald: "#4ade80",
        sky: "#60a5fa",
        violet: "#c084fc",
        danger: "#f87171",
        muted: "#8b8fa8",
        faint: "#545870",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
