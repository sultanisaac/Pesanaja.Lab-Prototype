import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#243746",
        secondary: {
          DEFAULT: "#F8FAFB",
          foreground: "#61707E",
        },
        brand: {
          DEFAULT: "#D4E2EB",
          foreground: "#243746",
        },
        primary: {
          DEFAULT: "#00B6C0",
          hover: "#009CA5",
          foreground: "#FFFFFF",
        },
        border: "#E5ECF0",
        success: {
          DEFAULT: "#3BB273",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FFB84D",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#F15B5B",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8FAFB",
          foreground: "#61707E",
        },
        accent: {
          DEFAULT: "#D4E2EB",
          foreground: "#243746",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#243746",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#243746",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        heading: ["var(--font-manrope)", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
