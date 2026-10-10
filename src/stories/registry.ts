// Historias disponibles. El contenido de cada una se carga solo cuando hace falta
// (la página de la historia o el Worker que corrige sus misiones).
import type { StoryContent } from "./types";

export const STORY_IDS = ["diez-dias", "la-consulta", "codigo-cuervo", "medianoche"] as const;
export type StoryId = (typeof STORY_IDS)[number];

export const loadContent: Record<StoryId, () => Promise<StoryContent>> = {
  "diez-dias": () => import("./diez-dias/content").then((m) => m.CONTENT),
  "la-consulta": () => import("./la-consulta/content").then((m) => m.CONTENT),
  "codigo-cuervo": () => import("./codigo-cuervo/content").then((m) => m.CONTENT),
  medianoche: () => import("./medianoche/content").then((m) => m.CONTENT),
};

export const isStoryId = (s: string): s is StoryId => (STORY_IDS as readonly string[]).includes(s);
