// La terminal libre: sin encargo ni comprobaciones, para probar lo que se quiera.
import type { Mission } from "./types";

export const FREE: Mission = {
  id: "libre",
  act: 0,
  title: "Terminal libre",
  concept: "Probar",
  phase: "dia",
  giver: "terminal",
  clock: "",
  briefing: [],
  lesson: {
    title: "Sin encargo, sin prisa",
    body: "Aquí no hay nada que acertar. Escribe lo que quieras probar y pulsa EJECUTAR: verás lo que imprime o el error, explicado. Lo que escribas se guarda para la próxima vez.",
    example: 'let nombre = "Byte";\nconsole.log(`Hola, ${nombre}`); // Hola, Byte',
  },
  task: "Experimenta. Si algo no sale, mejor: así se aprende.",
  starter: "// Prueba lo que quieras\nlet numeros = [3, 1, 2];\nconsole.log(numeros.length);\n",
  borrowed: [],
  cases: [{ label: "libre", globals: () => ({}) }],
  capture: [],
  check: () => ({ pass: true, feedback: "" }),
  hints: ["No hay pistas aquí: el cuaderno tiene todos los conceptos que ya viste."],
  debrief: [],
  clue: { title: "", text: "" },
};
