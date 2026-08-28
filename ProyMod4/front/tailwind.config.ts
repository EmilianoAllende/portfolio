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
        primaryColor: "#171717",
        secondaryColor: "#240041",
        tertiaryColor: "#2772db",
        quaternaryColor: "#FFD700",
      },
    },
  },
  plugins: [],
};
export default config;
