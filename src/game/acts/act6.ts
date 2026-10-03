// Acto 6 — "Tiempo real" (junio de 1987): asincronía. setTimeout, promesas,
// async/await, try/catch y Promise.all. Final de la historia principal.
import type { Mission } from "../types";
import { printed, probeErr, same, show } from "./util";

// Estado de las "puertas traseras" que dejó el intruso en cada nodo.
const ABIERTOS: Record<string, boolean> = {
  LBL: false,
  Tymnet: true,
  CostaEste: false,
  Satelite: true,
  Bremen: true,
  Hannover: false,
  Pentagono: true,
};
const CAIDOS = new Set(["Satelite", "Antartida"]);
const RESPUESTA_MS = 250;

/** Pregunta a un nodo si su puerta sigue abierta. Tarda; algunos no contestan. */
function preguntarNodo(nombre: string) {
  return new Promise<{ nombre: string; activo: boolean }>((resolve, reject) => {
    setTimeout(() => {
      if (CAIDOS.has(nombre)) reject(new Error(`${nombre} no responde`));
      else resolve({ nombre, activo: !!ABIERTOS[nombre] });
    }, RESPUESTA_MS);
  });
}
/** Versión sin caídas para las primeras misiones. */
function preguntarNodoSeguro(nombre: string) {
  return new Promise<{ nombre: string; activo: boolean }>((resolve) =>
    setTimeout(() => resolve({ nombre, activo: !!ABIERTOS[nombre] }), RESPUESTA_MS),
  );
}

const fnProbe = (name: string, expr: string) => `typeof ${name} !== "function" ? "__nofn" : (${expr})`;

export const ACT6: Mission[] = [
  {
    id: "m26",
    act: 6,
    title: "Más tarde",
    concept: "setTimeout",
    phase: "dia",
    giver: "ruth",
    clock: "10:00",
    async: true,
    briefing: [
      { who: "ruth", text: "Ahora que la red está conectada con medio mundo, nada responde al instante." },
      { who: "ruth", text: "Practica con algo sencillo: un aviso ahora y otro un poco después. Sin quedarte mirando la pantalla." },
    ],
    lesson: {
      title: "setTimeout: hacer algo más tarde",
      body: "`setTimeout(funcion, ms)` ejecuta la función pasados esos milisegundos. Mientras tanto, el resto del código sigue: no se queda esperando. Por eso lo que hay después del setTimeout se ejecuta antes. `() => ...` es una función flecha que no recibe nada.",
      example: 'setTimeout(() => console.log("segundo"), 500);\nconsole.log("primero");\n// primero\n// segundo',
    },
    task: "Usa `setTimeout` para mostrar \"listo\" pasados 300 ms, y muestra \"conectando\" de inmediato. En pantalla debe salir primero \"conectando\" y luego \"listo\".",
    starter: "// usa setTimeout aquí\n",
    borrowed: [],
    cases: [{ label: "un aviso diferido", globals: () => ({}) }],
    capture: [],
    check: ([o]) => {
      const l = o.logs.map((x) => x.trim());
      if (!o.calls.setTimeout) return { pass: false, feedback: "No usaste setTimeout. El segundo mensaje debe ir dentro: setTimeout(() => console.log(\"listo\"), 300);" };
      if (same(l, ["listo", "conectando"])) return { pass: false, feedback: "Salió al revés. Lo que no está dentro de setTimeout sale primero; pon \"listo\" dentro y \"conectando\" fuera." };
      if (l.length === 1 && l[0] === "conectando") return { pass: false, feedback: "Solo salió conectando. ¿Le pasaste a setTimeout una función? () => console.log(\"listo\")" };
      if (!same(l, ["conectando", "listo"])) return { pass: false, feedback: `En pantalla salió ${show(l)}; debía ser ["conectando","listo"].` };
      return { pass: true, feedback: "Primero lo inmediato, luego lo diferido. Así piensa la red." };
    },
    hints: [
      "Lo que debe salir más tarde va dentro de setTimeout, envuelto en una flecha; lo que sale ya va fuera, en una línea normal.",
      'Y aparte, sin setTimeout: console.log("conectando");',
      'setTimeout(() => console.log("listo"), 300);\nconsole.log("conectando");',
    ],
    debrief: [{ who: "ruth", text: "Lo raro no es que tarde. Lo raro es que el código de abajo no espere." }],
    clue: { title: "Tiempo", text: "La red no responde al instante: hay que programar esperando." },
  },
  {
    id: "m27",
    act: 6,
    title: "Una promesa de Bremen",
    concept: "Promesas",
    phase: "dia",
    giver: "ruth",
    clock: "11:30",
    async: true,
    briefing: [
      { who: "ruth", text: "Detuvieron a los de Hannover, pero dejaron puertas traseras abiertas en otros nodos." },
      { who: "ruth", text: "preguntarNodo(nombre) le pregunta a un nodo si su puerta sigue abierta. Tarda un poco: devuelve una promesa." },
      { who: "ruth", text: "Pregúntale a Bremen." },
    ],
    lesson: {
      title: "Promesas y .then",
      body: "Una promesa es un valor que llegará más tarde. Con .then(funcion) dices qué hacer cuando llegue: la función recibe el resultado.",
      example: "// pedirCafe() tarda y devuelve una promesa\npedirCafe().then((cafe) => {\n  console.log(`Llegó: ${cafe}`);\n});\nconsole.log(\"esperando...\");\n// esperando...\n// Llegó: espresso",
    },
    task: "Llama a `preguntarNodo(\"Bremen\")` y, con `.then`, muestra el texto \"NOMBRE: ACTIVO\", por ejemplo \"Bremen: true\". La respuesta trae `r.nombre` y `r.activo`.",
    starter: "// preguntarNodo ya existe\n",
    borrowed: ["preguntarNodo(nombre) → promesa de { nombre, activo }"],
    cases: [{ label: "nodo de Bremen", globals: () => ({ preguntarNodo: preguntarNodoSeguro }) }],
    capture: [],
    check: ([o]) => {
      const l = o.logs.map((x) => x.trim());
      if (!o.calls.preguntarNodo) return { pass: false, feedback: 'No llamaste a preguntarNodo("Bremen").' };
      if (l.some((x) => x.includes("[object Promise]") || x === "{}")) return { pass: false, feedback: "Mostraste la promesa, no su resultado. Usa .then((r) => console.log(...))." };
      if (l.some((x) => x.includes("undefined"))) return { pass: false, feedback: "Salió undefined: dentro del .then usa el parámetro que recibe la función (r.nombre, r.activo)." };
      if (!l.includes("Bremen: true")) return { pass: false, feedback: `En pantalla salió ${show(l)}; debía salir "Bremen: true".` };
      return { pass: true, feedback: "Bremen sigue abierto." };
    },
    hints: [
      'preguntarNodo("Bremen").then((r) => { ... });',
      "Dentro: console.log(`${r.nombre}: ${r.activo}`);",
      'preguntarNodo("Bremen").then((r) => {\n  console.log(`${r.nombre}: ${r.activo}`);\n});',
    ],
    debrief: [{ who: "sam", text: "Bremen sigue abierto. Y seguro que no es el único.", mood: "serio" }],
    clue: { title: "Puertas", text: "Quedan puertas traseras abiertas tras la redada." },
  },
  {
    id: "m28",
    act: 6,
    title: "Uno tras otro",
    concept: "async / await",
    phase: "dia",
    giver: "kessler",
    clock: "14:15",
    async: true,
    briefing: [
      { who: "kessler", text: "El FBI quiere la lista de nodos con la puerta abierta. Todos los de la ruta." },
      { who: "kessler", text: "Y Ruth dice que con tantos .then el código parece una escalera. Que hay una forma más limpia." },
    ],
    lesson: {
      title: "async y await",
      body: "Dentro de una función marcada con async puedes escribir await antes de una promesa: el código espera a que llegue el resultado y sigue, como si fuera inmediato. La función async devuelve a su vez una promesa.",
      example: "async function cafeDoble() {\n  const uno = await pedirCafe();\n  const dos = await pedirCafe();\n  return [uno, dos];\n}",
    },
    task: "Escribe la función `async revisar(nombres)`: recorre la lista `nombres`, espera `preguntarNodo` de cada uno y devuelve un array solo con los nombres cuya propiedad `activo` sea `true`.",
    starter: "async function revisar(nombres) {\n  const abiertos = [];\n  // recorre y espera aquí\n  return abiertos;\n}\n",
    borrowed: ["preguntarNodo(nombre) → promesa de { nombre, activo }"],
    cases: [{ label: "nodos de la ruta", globals: () => ({ preguntarNodo: preguntarNodoSeguro }) }],
    capture: [],
    probe: fnProbe("revisar", 'revisar(["LBL", "Tymnet", "CostaEste", "Bremen", "Hannover"])'),
    check: ([o]) => {
      const p = o.values.__probe;
      const err = probeErr(o);
      if (p === "__nofn") return { pass: false, feedback: "No encuentro la función revisar." };
      if (err) {
        if (/await is only valid|reserved word/i.test(err)) return { pass: false, feedback: "Usaste await fuera de una función async. Escribe async function revisar(nombres)." };
        return { pass: false, feedback: `revisar falló: ${err}` };
      }
      if (!Array.isArray(p)) return { pass: false, feedback: `revisar devolvió ${show(p)}. Debe devolver el array abiertos.` };
      if (p.length === 0) return { pass: false, feedback: "Quedó vacío. ¿Pusiste await delante de preguntarNodo? Sin await, r es una promesa y r.activo es undefined." };
      if (same(p, ["LBL", "Tymnet", "CostaEste", "Bremen", "Hannover"])) return { pass: false, feedback: "Guardaste todos los nodos. Solo los que tienen r.activo === true." };
      if (!same(p, ["Tymnet", "Bremen"])) return { pass: false, feedback: `revisar devolvió ${show(p)}; debía ser ["Tymnet","Bremen"]. Guarda r.nombre o el nombre del bucle.` };
      return { pass: true, feedback: "Tymnet y Bremen. Uno tras otro, sin escaleras." };
    },
    hints: [
      "Recorre nombres con for...of. En cada vuelta pregunta al nodo con await preguntarNodo(nombre) y guarda la respuesta en r.",
      "if (r.activo) abiertos.push(nombre);",
      "async function revisar(nombres) {\n  const abiertos = [];\n  for (const nombre of nombres) {\n    const r = await preguntarNodo(nombre);\n    if (r.activo) abiertos.push(nombre);\n  }\n  return abiertos;\n}",
    ],
    debrief: [{ who: "kessler", text: "Dos puertas. Que las cierren mañana.", mood: "serio" }],
    clue: { title: "Dos puertas", text: "Tymnet y Bremen siguen abiertos." },
  },
  {
    id: "m29",
    act: 6,
    title: "El nodo que no contesta",
    concept: "try / catch",
    phase: "dia",
    giver: "ruth",
    clock: "16:50",
    async: true,
    briefing: [
      { who: "ruth", text: "Problema: el enlace del satélite no contesta. Y cuando un nodo no contesta, la promesa falla y tu programa entero se cae." },
      { who: "ruth", text: "Necesito que, si un nodo falla, lo apunte como \"sin respuesta\" y siga con los demás." },
    ],
    lesson: {
      title: "try / catch: atrapar errores",
      body: "Si algo dentro de `try` falla (también un `await` de una promesa rechazada), el programa no se cae: salta al bloque `catch`, donde decides qué hacer. Pon el `await` dentro del `try`: sin await, el error se escapa del catch.",
      example: 'async function seguro() {\n  try {\n    return await pedirCafe();\n  } catch (error) {\n    return "sin cafe";\n  }\n}',
    },
    task: "Escribe la función `async estado(nombre)`: devuelve el `activo` del nodo (`true` o `false`); si `preguntarNodo` falla, devuelve \"sin respuesta\".",
    starter: "async function estado(nombre) {\n  // tu código\n}\n",
    borrowed: ["preguntarNodo(nombre) → promesa (¡a veces falla!)"],
    cases: [{ label: "nodos con fallos", globals: () => ({ preguntarNodo }) }],
    capture: [],
    probe: fnProbe("estado", '(async () => [await estado("Bremen"), await estado("Satelite"), await estado("LBL")])()'),
    check: ([o]) => {
      const p = o.values.__probe;
      const err = probeErr(o);
      if (p === "__nofn") return { pass: false, feedback: "No encuentro la función estado." };
      if (err) {
        if (/no responde/.test(err)) return { pass: false, feedback: "El error del satélite se escapó. Envuelve el await en try { ... } catch (error) { ... }." };
        return { pass: false, feedback: `estado falló: ${err}` };
      }
      const got = p as unknown[];
      if (got[1] === undefined) return { pass: false, feedback: 'En el catch hay que devolver el texto: return "sin respuesta";' };
      if (got[0] && typeof got[0] === "object") return { pass: false, feedback: "Devolviste la respuesta entera. Devuelve solo r.activo." };
      if (!same(got, [true, "sin respuesta", false])) return { pass: false, feedback: `Obtuve ${show(got)} y debía ser [true,"sin respuesta",false].` };
      return { pass: true, feedback: "El satélite calla, pero el programa sigue en pie." };
    },
    hints: [
      "try { const r = await preguntarNodo(nombre); return r.activo; } catch (error) { ... }",
      'En el catch: return "sin respuesta";',
      'async function estado(nombre) {\n  try {\n    const r = await preguntarNodo(nombre);\n    return r.activo;\n  } catch (error) {\n    return "sin respuesta";\n  }\n}',
    ],
    debrief: [
      { who: "ruth", text: "El satélite no contesta... porque alguien lo está usando ahora mismo.", mood: "sorpresa" },
      { who: "sam", text: "Esta noche vuelven. A borrar las huellas que quedan." },
    ],
    clue: { title: "Silencio", text: "El satélite no responde: alguien lo está usando." },
  },
  {
    id: "m30",
    act: 6,
    title: "Todos a la vez",
    concept: "Promise.all",
    phase: "noche",
    giver: "terminal",
    clock: "03:33",
    async: true,
    briefing: [
      { who: "narrador", text: "Junio. La ventana abierta, el calor de la noche y el zumbido de la VAX." },
      { who: "sistema", text: "03:33 — ALGUIEN BORRA REGISTROS EN VARIOS NODOS A LA VEZ" },
      { who: "sam", text: "Si los pregunto de uno en uno, cuando llegue al último ya habrá borrado todo." },
      { who: "ruth", text: "Entonces pregúntales a todos a la vez, Sam. Ahora." },
    ],
    lesson: {
      title: "Promise.all: esperar varias cosas en paralelo",
      body: "`Promise.all(listaDePromesas)` espera a todas a la vez y devuelve una lista con todos los resultados. Si cada una tarda lo mismo, el total tarda como una sola, no como la suma. `nodos.map(preguntarNodo)` llama a preguntarNodo con cada nombre y te da una lista de promesas: justo lo que Promise.all espera. En esta terminal puedes usar `await` directamente, fuera de una función async: la terminal ya lo prepara por ti.",
      example: "const respuestas = await Promise.all([pedirCafe(), pedirTe()]);\nconsole.log(respuestas.length); // 2\n// tarda lo que la más lenta, no la suma",
    },
    task: "Pregunta a todos los elementos de la lista `nodos` en paralelo con `Promise.all`. Guarda en `abiertos` cuántos tienen `activo` en `true` y muéstralo. Tienes menos de medio segundo.",
    starter: "// nodos ya existe\nconst respuestas = await Promise.all(/* aquí */);\n",
    borrowed: ['nodos = ["Tymnet", "Bremen", "Pentagono", ...]', "preguntarNodo(nombre) → promesa"],
    cases: [
      { label: "esta noche", globals: () => ({ preguntarNodo: preguntarNodoSeguro, nodos: ["Tymnet", "Bremen", "Pentagono", "LBL", "Hannover"] }) },
      { label: "nodos de reserva", globals: () => ({ preguntarNodo: preguntarNodoSeguro, nodos: ["CostaEste", "Pentagono", "LBL"] }) },
    ],
    capture: ["abiertos"],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const o = outs[i];
        const nodos = cases[i].globals().nodos as string[];
        const want = nodos.filter((n) => ABIERTOS[n]).length;
        const t = o.elapsed ?? 0;
        if (o.values.abiertos === undefined) return { pass: false, feedback: "Falta la variable abiertos." };
        if ((o.calls.preguntarNodo ?? 0) < nodos.length) return { pass: false, feedback: `Solo preguntaste a ${o.calls.preguntarNodo ?? 0} nodos de ${nodos.length}. Usa nodos.map(preguntarNodo).` };
        if (t > RESPUESTA_MS * 2.2)
          return { pass: false, feedback: `Tardaste ${Math.round(t)} ms: los preguntaste de uno en uno. Con Promise.all(nodos.map(preguntarNodo)) van todos a la vez.` };
        if (o.values.abiertos !== want) return { pass: false, feedback: `abiertos vale ${show(o.values.abiertos)} y eran ${want}. Cuenta las respuestas con activo true (filter y length).` };
        if (!printed(o, String(want))) return { pass: false, feedback: "Bien contado y a tiempo. Falta console.log(abiertos)." };
      }
      return { pass: true, feedback: "Cinco nodos en un cuarto de segundo. Todas las puertas, a la vista." };
    },
    hints: [
      "Primero convierte la lista de nombres en una lista de preguntas con nodos.map(preguntarNodo). Después pásale esa lista a Promise.all.",
      "const abiertos = respuestas.filter((r) => r.activo).length;",
      "const respuestas = await Promise.all(nodos.map(preguntarNodo));\nconst abiertos = respuestas.filter((r) => r.activo).length;\nconsole.log(abiertos);",
    ],
    debrief: [
      { who: "sistema", text: "03:34 — PUERTAS TRASERAS LOCALIZADAS: 3 — CERRANDO" },
      { who: "ruth", text: "Cerradas. Las tres. Antes de que borrara nada.", mood: "alegre" },
      { who: "sam", text: "Se acabó. De verdad, esta vez.", mood: "alegre" },
    ],
    clue: { title: "Cerrado", text: "Todas las puertas traseras localizadas y cerradas a tiempo." },
  },
];
