import type { Config } from "tailwindcss";

/**
 * Preset compartilhado de design tokens.
 * Qualquer app do monorepo (apps/web, e futuros) estende este preset
 * no próprio tailwind.config.ts para herdar cores, raio e fontes.
 */
const preset: Omit<Config, "content"> = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--au-background) / <alpha-value>)",
        foreground: "hsl(var(--au-foreground) / <alpha-value>)",
        muted: "hsl(var(--au-muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--au-muted-foreground) / <alpha-value>)",
        card: "hsl(var(--au-card) / <alpha-value>)",
        "card-foreground": "hsl(var(--au-card-foreground) / <alpha-value>)",
        border: "hsl(var(--au-border) / <alpha-value>)",
        input: "hsl(var(--au-input) / <alpha-value>)",
        accent: "hsl(var(--au-accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--au-accent-foreground) / <alpha-value>)",
        ring: "hsl(var(--au-ring) / <alpha-value>)",
      },
      borderRadius: {
        sm: "calc(var(--au-radius) - 6px)",
        md: "calc(var(--au-radius) - 3px)",
        lg: "var(--au-radius)",
        xl: "calc(var(--au-radius) + 6px)",
        "2xl": "calc(var(--au-radius) + 12px)",
      },
      fontFamily: {
        sans: ["var(--au-font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default preset;
