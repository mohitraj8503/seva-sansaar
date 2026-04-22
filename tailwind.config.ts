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
        saffron: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF9933",
          600: "#E68A2E",
          700: "#CC7A29",
          800: "#B36B24",
          900: "#995C1F",
          DEFAULT: "#FF9933",
        },
        "india-green": {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#138808",
          600: "#107A07",
          700: "#0E6C06",
          800: "#0B5E05",
          900: "#095004",
          DEFAULT: "#138808",
        },
        navy: {
          50: "#F0F0F7",
          100: "#E1E1F0",
          200: "#C3C3E1",
          300: "#A5A5D2",
          400: "#6969B4",
          500: "#000080",
          600: "#000073",
          700: "#000066",
          800: "#000059",
          900: "#00004D",
          DEFAULT: "#1a2d5c",
          dark: "#132246",
        },
        "seva-offwhite": "#F8F7F4",
        "seva-muted": "#6B7280",
        "seva-border": "#E5E7EB",
        "seva-gold": "#D4A017",
        dark: {
          DEFAULT: "#04040A",
          50: "#080812",
          100: "#0C0C1A",
        },
        midnight: {
          900: '#0B0C10',
          800: '#1A1D29',
        },
        "rose-gold": {
          200: '#F3E5E5',
          400: '#E2B4B4',
          500: '#D48792',
        },
        violetLuxe: {
          450: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-poppins)", "Poppins", "sans-serif"],
        hindi: ["var(--font-noto-hindi)", "Noto Sans Devanagari", "sans-serif"],
        "hindi-serif": ["var(--font-noto-serif)", "Noto Serif", "Georgia", "serif"],
      },
      boxShadow: {
        "premium-sm": "0 2px 4px rgba(0,0,0,0.02), 0 1px 0 rgba(0,0,0,0.02)",
        "premium-md": "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
        "premium-lg": "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)",
        "card": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.03)",
        "search": "0 10px 40px -10px rgba(0,0,0,0.1), 0 4px 12px -2px rgba(0,0,0,0.04)",
        "search-focus": "0 20px 60px -15px rgba(255,153,51,0.2), 0 4px 12px -2px rgba(0,0,0,0.05)",
        "elevated": "0 25px 50px -12px rgba(0,0,0,0.15), 0 8px 20px -6px rgba(0,0,0,0.05)",
        "glow-saffron": "0 0 20px rgba(255,153,51,0.15)",
        "glow-green": "0 0 20px rgba(19,136,8,0.15)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "counter": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "counter": "counter 0.4s ease-out forwards",
        "shimmer": "shimmer 2s infinite",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      transitionDuration: {
        "2000": "2000ms",
      },
    },
  },
  plugins: [],
};
export default config;
