// Puesta en escena de cada misión: lo que pasa en el laboratorio además del
// diálogo y la terminal. No cambia la historia; le da cuerpo.
import type { Line } from "./types";

export interface Pickup {
  /** Dónde está: la impresora, el archivador o el teléfono. */
  at: "printer" | "filing" | "phone";
  /** Texto del objetivo y de la tecla E. */
  label: string;
  /** Lo que se dice al recogerlo (una llamada, un comentario...). */
  lines: Line[];
}

export interface Staging {
  pickup?: Pickup;
  /** Ruth acompaña a Sam esa noche junto a su escritorio. */
  ruthAtNight?: boolean;
}

export const STAGE: Record<string, Staging> = {
  m5: {
    pickup: {
      at: "printer",
      label: "Recoger el registro de la impresora",
      lines: [{ who: "sam", text: "Treinta días de conexiones en papel continuo. Lo paso a la terminal." }],
    },
  },
  m7: {
    pickup: {
      at: "printer",
      label: "Recoger el listado de horas",
      lines: [{ who: "sam", text: "Todas las conexiones de anoche. Becarios, gente de día... y alguien más." }],
    },
  },
  m10: { ruthAtNight: true },
  m12: {
    pickup: {
      at: "filing",
      label: "Sacar el expediente del archivador",
      lines: [{ who: "sam", text: "\"REGISTROS — SEMANA 49\". Ruth tiene una letra impecable." }],
    },
  },
  m15: { ruthAtNight: true },
  m16: {
    pickup: {
      at: "phone",
      label: "Contestar el teléfono",
      lines: [
        { who: "narrador", text: "Una voz con acento alemán: «Policía de Hannover. Las facturas telefónicas salen ahora por télex.»" },
        { who: "sam", text: "Danke. Creo." },
      ],
    },
  },
  m19: {
    pickup: {
      at: "printer",
      label: "Recoger los mensajes interceptados",
      lines: [{ who: "sam", text: "Cinco mensajes. Casi todos parecen nada. Casi." }],
    },
  },
  m22: {
    pickup: {
      at: "phone",
      label: "Contestar el teléfono",
      lines: [
        { who: "narrador", text: "La línea cruje: «Bremen al habla. ¿En qué formato quieren los nodos?»" },
        { who: "sam", text: "Nombre y ciudad entre paréntesis. Ahora mismo se lo preparo." },
      ],
    },
  },
  m25: { ruthAtNight: true },
  m27: {
    pickup: {
      at: "phone",
      label: "Contestar el teléfono",
      lines: [
        { who: "narrador", text: "«Aquí Bremen. Alguien sigue entrando por nuestro nodo. ¿Pueden comprobarlo desde allí?»" },
        { who: "sam", text: "Le pregunto a su nodo ahora mismo." },
      ],
    },
  },
  m30: { ruthAtNight: true },
};

export const stageOf = (id: string | undefined): Staging => (id ? STAGE[id] ?? {} : {});
