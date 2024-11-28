import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0a192f',
        gold: '#ffd700',
        lightBg: '#ffffff',
        darkBg: '#0a192f',
      },
    },
  },
  plugins: [],
};
export default config;
