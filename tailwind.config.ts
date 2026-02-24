import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        /* Zentrade - Colores necesarios */
        zen: {
          "rich-black": "#001B1F",
          "dark-green": "#002E21",
          "bangladesh-green": "#006A4E",
          "mountain-meadow": "#3DBB8F",
          "caribbean-green": "#00C17C",
          "anti-flash": "#F2F3F4",
          forest: "#0F5132",
          danger: "#E5484D",
          // Aliases semánticos para landing
          surface: "#002E21",
          "surface-elevated": "#006A4E",
          "text-muted": "rgba(242, 243, 244, 0.6)",
          "border-soft": "rgba(242, 243, 244, 0.05)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
