import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://anku0669.github.io",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});