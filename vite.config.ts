import { resolve } from "node:path";
import { defineConfig } from "vite";

// Dos páginas: la landing de Eternal Games en la raíz y el juego en /75-centavos/.
export default defineConfig({
  // la clave pública de Clerk llega de la integración de Vercel con prefijo NEXT_PUBLIC_;
  // solo esa se expone al navegador (nunca CLERK_SECRET_KEY ni DATABASE_URL)
  envPrefix: ["VITE_", "NEXT_PUBLIC_CLERK_"],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "index.html"),
        juego: resolve(__dirname, "75-centavos/index.html"),
        perfil: resolve(__dirname, "perfil/index.html"),
      },
    },
  },
});
