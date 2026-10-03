// Los mentores de las sesiones de práctica: quién es, dónde vive y cómo se dice
// ir a verle. Margarita para lo básico (actos 1 y 2), Gus para los actos 3 y 4,
// Benny para los actos 5 y 6. Las escenas de cada lugar están en scenes/places.ts.
export type MentorKey = "margarita" | "gus" | "benny";

export interface MentorInfo {
  /** Nombre en los textos: "Margarita". */
  name: string;
  /** Complemento de lugar para "Ve ___" / "Ir ___": "a casa de Margarita". */
  to: string;
  /** Tarjeta al llegar: lugar y barrio. */
  card: [string, string];
  /** Rótulo del viaje en bici. */
  travel: string;
}

export const MENTORS: Record<MentorKey, MentorInfo> = {
  margarita: {
    name: "Margarita",
    to: "a casa de Margarita",
    card: ["Casa de Margarita", "Elmwood, Berkeley"],
    travel: "Rumbo a casa de Margarita",
  },
  gus: {
    name: "Gus",
    to: "al garaje de Gus",
    card: ["Garaje de Gus", "Rockridge, Oakland"],
    travel: "Rumbo al garaje de Gus",
  },
  benny: {
    name: "Benny",
    to: "al cuarto de Benny",
    card: ["Cuarto de Benny", "Southside, Berkeley"],
    travel: "Rumbo al cuarto de Benny",
  },
};
