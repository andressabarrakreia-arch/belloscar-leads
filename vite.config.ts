import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Em produção (GitHub Pages do repo): /belloscar-leads/
// Em desenvolvimento local: /
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/belloscar-leads/" : "/",
  server: {
    port: 5173,
  },
}));
