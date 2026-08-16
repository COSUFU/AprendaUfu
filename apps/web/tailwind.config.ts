import type { Config } from "tailwindcss";
import uiPreset from "@aprendaufu/ui/tailwind.config";

const config: Config = {
  presets: [uiPreset],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
