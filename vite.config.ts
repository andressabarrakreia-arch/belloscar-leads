import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Produção: caminhos relativos. Funciona na raiz de andressacarmetrics.com.br
// e também em /belloscar-leads/ enquanto o DNS do domínio ainda propaga.
// Em desenvolvimento local: /
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  base: command === "build" ? "./" : "/",
  server: {
    port: 5173,
    watch: {
      // Skills e o mapa do código não entram na página. Vigiar essas pastas
      // derruba o servidor local quando o Windows trava um arquivo (EBUSY).
      ignored: ["**/.agents/**", "**/graphify-out/**"],
    },
  },
}));
