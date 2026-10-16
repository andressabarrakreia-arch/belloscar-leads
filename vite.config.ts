import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Repo público: https://<user>.github.io/belloscar-leads/
export default defineConfig({
  plugins: [react()],
  base: "/belloscar-leads/",
  server: {
    port: 5173,
  },
});
