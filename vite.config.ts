import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Produção: caminhos relativos. Funciona na raiz de andressacarmetrics.com.br
// e também em /belloscar-leads/ enquanto o DNS do domínio ainda propaga.
// Em desenvolvimento local: /
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "./" : "/",
  server: {
    port: 5173,
  },
}));
