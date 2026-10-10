import { resolve } from "node:path";
import { defineConfig } from "vite";

// Páginas: la landing de Eternal Games en la raíz, el juego en /75-centavos/,
// el perfil en /perfil/, los retos en /retos/ y una página por cada historia nueva.
export default defineConfig({
  // la clave pública de Clerk llega de la integración de Vercel con prefijo NEXT_PUBLIC_;
  // solo esa se expone al navegador (nunca CLERK_SECRET_KEY ni DATABASE_URL)
  envPrefix: ["VITE_", "NEXT_PUBLIC_CLERK_"],
  // el Worker que corrige es un módulo: así el motor SQL, el DOM ligero y cada
  // historia se cargan solo cuando una misión los necesita
  worker: { format: "es" },
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "index.html"),
        juego: resolve(__dirname, "75-centavos/index.html"),
        perfil: resolve(__dirname, "perfil/index.html"),
        retos: resolve(__dirname, "retos/index.html"),
        "diez-dias": resolve(__dirname, "diez-dias/index.html"),
        "la-consulta": resolve(__dirname, "la-consulta/index.html"),
        "codigo-cuervo": resolve(__dirname, "codigo-cuervo/index.html"),
        medianoche: resolve(__dirname, "medianoche/index.html"),
      },
    },
  },
});
