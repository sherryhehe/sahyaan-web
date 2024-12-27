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
        primary: {
          DEFAULT: "#181825", // This makes 'primary' default to the 500 shade
          50: "#EAEAEF",
          100: "#D5D5DF",
          200: "#ABABBF",
          300: "#81819F",
          400: "#57577F",
          500: "#181825",
          600: "#13131D",
          700: "#0E0E16",
          800: "#0A0A0E",
          900: "#050507",
        },
        secondary: {
          DEFAULT: "#45475a", // This makes 'secondary' default to the 500 shade
          50: "#F7F7F9",
          100: "#EEEEF2",
          200: "#DDDDE6",
          300: "#CCCCDA",
          400: "#BBBBCD",
          500: "#45475a",
          600: "#373948",
          700: "#292B36",
          800: "#1B1C24",
          900: "#0D0E12",
        },
        bg: {
          DEFAULT: "#ffffff", // This makes 'bg' default to the 50 shade (which is white in this case)
          50: "#FFFFFF",
          100: "#F2F2F2",
          200: "#E6E6E6",
          300: "#D9D9D9",
          400: "#CCCCCC",
          500: "#BFBFBF",
          600: "#B3B3B3",
          700: "#A6A6A6",
          800: "#999999",
          900: "#8C8C8C",
        },
        text: {
          DEFAULT: "#11111b", // This makes 'text' default to the 500 shade
          50: "#E6E6E7",
          100: "#CDCDCF",
          200: "#9B9B9F",
          300: "#69696F",
          400: "#37373F",
          500: "#11111b",
          600: "#0E0E16",
          700: "#0A0A10",
          800: "#07070B",
          900: "#030305",
        },
      },
    },
  },
  plugins: [],
};
