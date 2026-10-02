import { resolve } from "node:path";
import { defineConfig } from "vite";

// Dos páginas: la landing de Eternal Games en la raíz y el juego en /75-centavos/.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "index.html"),
        juego: resolve(__dirname, "75-centavos/index.html"),
      },
    },
  },
});
