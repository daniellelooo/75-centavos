// Acto 4 — "El comprador" (enero de 1987): alcance de las variables y closures.
// El rastro de Hannover lleva a quien paga por lo que el intruso encuentra.
import type { Mission } from "../types";
import { printed, probeErr, same, show } from "./util";

const fnProbe = (name: string, expr: string) => `typeof ${name} !== "function" ? "__nofn" : (${expr})`;

const MENSAJES_A = [
  "hola, sigues ahi?",
  "segundo pago recibido",
  "necesito mas planos",
  "el pago llega el viernes",
  "buen viaje",
];
const MENSAJES_B = ["sin novedades", "pago por adelantado", "nos vemos en Berlin"];

export const ACT4: Mission[] = [
  {
    id: "m16",
    act: 4,
    title: "Lo que ve cada bloque",
    concept: "Alcance",
    phase: "dia",
    giver: "ruth",
    clock: "09:30",
    briefing: [
      { who: "ruth", text: "La policía alemana nos manda las facturas de teléfono del apartamento de Hannover." },
      { who: "ruth", text: "Escribí un programa para sumar los minutos de llamadas... y no funciona. Ni siquiera arranca." },
      { who: "ruth", text: "Arréglalo tú. Yo ya no veo las llaves de tanto mirarlas.", mood: "serio" },
    ],
    lesson: {
      title: "Alcance: dónde vive una variable",
      body: "Una variable creada con let dentro de unas llaves { } solo existe dentro de esas llaves. Si la necesitas después del bloque, créala antes, fuera. Y si la creas dentro de un bucle, se vuelve a crear en cada vuelta.",
      example: "let suma = 0;          // fuera: sobrevive al bucle\nfor (let i = 0; i < 3; i++) {\n  let doble = i * 2;   // dentro: muere en cada vuelta\n  suma += doble;\n}\nconsole.log(suma); // 6",
    },
    task: "El código de Ruth falla. Arréglalo para que total sume todos los minutos de llamadas y se muestre al final.",
    starter: "for (let i = 0; i < llamadas.length; i++) {\n  let total = 0;\n  total += llamadas[i];\n}\nconsole.log(total);\n",
    borrowed: ["llamadas = [12, 30, 7, ...]"],
    cases: [
      { label: "facturas de diciembre", globals: () => ({ llamadas: [12, 30, 7] }) },
      { label: "facturas de enero", globals: () => ({ llamadas: [45, 5, 20, 10] }) },
    ],
    capture: ["total"],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const ll = cases[i].globals().llamadas as number[];
        const want = ll.reduce((a, b) => a + b, 0);
        const v = outs[i].values.total;
        if (v === ll[ll.length - 1]) return { pass: false, feedback: `total quedó en ${v}: solo la última llamada. Se reinicia en cada vuelta porque se crea dentro del bucle.` };
        if (v !== want) return { pass: false, feedback: `Con ${cases[i].label} total vale ${show(v)} y debía ser ${want}.` };
        if (!printed(outs[i], String(want))) return { pass: false, feedback: "La suma está bien. Falta console.log(total)." };
      }
      return { pass: true, feedback: "La variable vive fuera del bucle y por fin recuerda." };
    },
    hints: [
      "El error dice que total no existe fuera del for. ¿Dónde se crea?",
      "Saca let total = 0; antes del for, y deja dentro solo total += llamadas[i];",
      "let total = 0;\nfor (let i = 0; i < llamadas.length; i++) {\n  total += llamadas[i];\n}\nconsole.log(total);",
    ],
    debrief: [
      { who: "ruth", text: "Así que el total se moría en cada vuelta. Pobrecito." },
      { who: "sam", text: "Y las llamadas largas van todas al mismo número. En Berlín Este.", mood: "serio" },
    ],
    clue: { title: "Berlín Este", text: "Las llamadas largas de Hannover van al mismo número de Berlín Este." },
  },
  {
    id: "m17",
    act: 4,
    title: "Un contador que recuerda",
    concept: "Closures",
    phase: "dia",
    giver: "kessler",
    clock: "11:15",
    briefing: [
      { who: "kessler", text: "El hombre del gobierno quiere contar los mensajes de cada canal por separado. Uno, dos, tres..." },
      { who: "kessler", text: "Y no quiere variables globales sueltas por ahí. Dice que \"se contaminan\". No sé qué significa." },
    ],
    lesson: {
      title: "Closures: funciones con memoria",
      body: "Una función creada dentro de otra recuerda las variables de la función que la creó, incluso después de que esta termine. Así cada contador guarda su propio número, privado, sin variables globales.",
      example: "function crearSaludo(nombre) {\n  return function () {\n    return `Hola, ${nombre}`;\n  };\n}\nconst hola = crearSaludo(\"Ruth\");\nconsole.log(hola()); // Hola, Ruth",
    },
    task: "Escribe crearContador(): crea una variable cuenta en 0 y devuelve una función que, cada vez que se llama, suma 1 a cuenta y la devuelve. Cada contador cuenta por separado.",
    starter: "function crearContador() {\n  // tu código\n}\n",
    borrowed: [],
    cases: [{ label: "dos canales", globals: () => ({}) }],
    capture: [],
    probe: fnProbe("crearContador", "(() => { const a = crearContador(); const b = crearContador(); if (typeof a !== \"function\") return \"__nofnret\"; return [a(), a(), a(), b(), a(), b()]; })()"),
    check: ([o]) => {
      const p = o.values.__probe;
      const err = probeErr(o);
      if (p === "__nofn") return { pass: false, feedback: "No encuentro la función crearContador." };
      if (p === "__nofnret") return { pass: false, feedback: "crearContador debe devolver una función: return function () { ... }" };
      if (err) return { pass: false, feedback: `Al usar tu contador falló: ${err}` };
      const got = p as unknown[];
      if (same(got, [1, 1, 1, 1, 1, 1])) return { pass: false, feedback: "Siempre devuelve 1: la cuenta se crea dentro de la función que devuelves. Créala fuera, en crearContador." };
      if (same(got, [1, 2, 3, 4, 5, 6])) return { pass: false, feedback: "Los dos contadores comparten la cuenta: está fuera de crearContador. Cada contador necesita la suya." };
      if (got.every((x) => x === undefined)) return { pass: false, feedback: "La función devuelta no devuelve nada. Falta return cuenta." };
      if (!same(got, [1, 2, 3, 1, 4, 2])) return { pass: false, feedback: `Llamando a a, a, a, b, a, b obtuve ${show(got)} y debía ser [1,2,3,1,4,2].` };
      return { pass: true, feedback: "Cada canal con su propia memoria. Sin una sola variable global." };
    },
    hints: [
      "Dentro de crearContador: let cuenta = 0; y después return function () { ... }",
      "La función devuelta hace cuenta++ y return cuenta;",
      "function crearContador() {\n  let cuenta = 0;\n  return function () {\n    cuenta++;\n    return cuenta;\n  };\n}",
    ],
    debrief: [
      { who: "kessler", text: "Funciona. Y nadie sabe dónde está la variable. Eso le va a encantar.", mood: "alegre" },
    ],
    clue: { title: "Canales", text: "El comprador usa varios canales a la vez: cada uno con su cuenta." },
  },
  {
    id: "m18",
    act: 4,
    title: "Palabras clave",
    concept: "Funciones que crean funciones",
    phase: "dia",
    giver: "ruth",
    clock: "14:00",
    briefing: [
      { who: "ruth", text: "Los mensajes interceptados son un mar de tonterías. Quiero filtros: uno para \"pago\", otro para \"Berlin\"..." },
      { who: "ruth", text: "Pero no quiero escribir una función nueva por cada palabra." },
    ],
    lesson: {
      title: "Fábricas de funciones",
      body: "Con un closure puedes fabricar funciones a medida: le pasas un dato y te devuelve una función que lo recuerda. Para saber si un texto contiene otro usa texto.includes(palabra), que devuelve true o false.",
      example: "function crearMultiplicador(n) {\n  return (x) => x * n;\n}\nconst triple = crearMultiplicador(3);\nconsole.log(triple(5)); // 15\nconsole.log(\"buen dia\".includes(\"dia\")); // true",
    },
    task: "Escribe crearFiltro(palabra): devuelve una función que recibe un mensaje y devuelve true si el mensaje contiene esa palabra.",
    starter: "function crearFiltro(palabra) {\n  // tu código\n}\n",
    borrowed: [],
    cases: [{ label: "mensajes de prueba", globals: () => ({}) }],
    capture: [],
    probe: fnProbe("crearFiltro", '(() => { const pago = crearFiltro("pago"); const berlin = crearFiltro("Berlin"); if (typeof pago !== "function") return "__nofnret"; return [pago("primer pago recibido"), pago("hola"), berlin("viaje a Berlin"), berlin("pago enviado")]; })()'),
    check: ([o]) => {
      const p = o.values.__probe;
      const err = probeErr(o);
      if (p === "__nofn") return { pass: false, feedback: "No encuentro la función crearFiltro." };
      if (p === "__nofnret") return { pass: false, feedback: "crearFiltro debe devolver una función. Por ejemplo: return (mensaje) => ..." };
      if (err) return { pass: false, feedback: `Tu filtro falló al usarlo: ${err}` };
      const got = p as unknown[];
      if (got.every((x) => x === undefined)) return { pass: false, feedback: "El filtro no devuelve nada. Si usas llaves en la flecha, hace falta return." };
      if (!same(got, [true, false, true, false]))
        return { pass: false, feedback: `Probé "pago" y "Berlin" con cuatro mensajes y obtuve ${show(got)}; debía ser [true,false,true,false].` };
      return { pass: true, feedback: "Una fábrica de filtros. Ruth ya está pensando diez palabras más." };
    },
    hints: [
      "crearFiltro devuelve una función: return (mensaje) => ...",
      "Dentro: mensaje.includes(palabra)",
      "function crearFiltro(palabra) {\n  return (mensaje) => mensaje.includes(palabra);\n}",
    ],
    debrief: [{ who: "ruth", text: "Ahora a ver qué dicen de verdad esos mensajes." }],
    clue: { title: "Filtros", text: "Filtros a medida para cada palabra sospechosa." },
  },
  {
    id: "m19",
    act: 4,
    title: "Hablan de dinero",
    concept: "Closures y filter",
    phase: "dia",
    giver: "ruth",
    clock: "16:20",
    briefing: [
      { who: "ruth", text: "Te dejé los mensajes interceptados en mensajes. Usa tu fábrica de filtros." },
      { who: "ruth", text: "Quiero solo los que hablan de pagos." },
    ],
    lesson: {
      title: "Pasar una función fabricada a filter",
      body: "filter recibe una función que dice sí o no. La que fabrica crearFiltro es justo eso, así que puedes pasarla directamente: lista.filter(crearFiltro(\"palabra\")).",
      example: "const esPar = (n) => n % 2 === 0;\nconsole.log([1, 2, 3, 4].filter(esPar)); // [2, 4]",
    },
    task: 'Usa tu crearFiltro (escríbelo de nuevo arriba) y filter para guardar en pagos los mensajes que contienen "pago". Muestra pagos.length.',
    starter: "function crearFiltro(palabra) {\n  return (mensaje) => mensaje.includes(palabra);\n}\n\n// usa mensajes y crearFiltro aquí\n",
    borrowed: ["mensajes = [\"hola, sigues ahi?\", ...]"],
    cases: [
      { label: "mensajes de enero", globals: () => ({ mensajes: [...MENSAJES_A] }) },
      { label: "mensajes de febrero", globals: () => ({ mensajes: [...MENSAJES_B] }) },
    ],
    capture: ["pagos"],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const ms = cases[i].globals().mensajes as string[];
        const want = ms.filter((m) => m.includes("pago"));
        const v = outs[i].values.pagos;
        if (v === undefined) return { pass: false, feedback: "Falta la variable pagos." };
        if (!Array.isArray(v)) return { pass: false, feedback: "pagos debe ser el array que devuelve filter." };
        if (!same(v, want)) return { pass: false, feedback: `Con ${cases[i].label} pagos quedó ${show(v)}; debía ser ${show(want)}.` };
        if (!printed(outs[i], String(want.length))) return { pass: false, feedback: "Los pagos están bien. Falta console.log(pagos.length)." };
      }
      return { pass: true, feedback: "Dos pagos en enero. Alguien cobra por esos planos." };
    },
    hints: [
      'const pagos = mensajes.filter(crearFiltro("pago"));',
      "Después: console.log(pagos.length);",
      'function crearFiltro(palabra) {\n  return (mensaje) => mensaje.includes(palabra);\n}\n\nconst pagos = mensajes.filter(crearFiltro("pago"));\nconsole.log(pagos.length);',
    ],
    debrief: [
      { who: "sam", text: "\"Necesito más planos.\" \"El pago llega el viernes.\" No es un curioso. Es un negocio.", mood: "serio" },
      { who: "ruth", text: "Y esta noche alguien está probando contraseñas en nuestra VAX. Una tras otra." },
    ],
    clue: { title: "Pagos", text: "Mensajes sobre pagos y planos: alguien compra lo robado." },
  },
  {
    id: "m20",
    act: 4,
    title: "La bóveda",
    concept: "Estado privado",
    phase: "noche",
    giver: "terminal",
    clock: "02:10",
    briefing: [
      { who: "narrador", text: "Enero. Nieva sobre Berkeley, algo que casi nunca pasa." },
      { who: "sam", text: "Alguien prueba contraseñas contra el archivo de pruebas. Si lo borra, no queda caso." },
      { who: "sam", text: "Necesito una bóveda: que se abra con la clave correcta y se bloquee para siempre tras tres fallos." },
    ],
    lesson: {
      title: "Objetos con estado privado",
      body: "Una función puede devolver un objeto con métodos. Los métodos comparten las variables de la función que los creó (un closure), y nadie de fuera puede tocarlas: es estado privado.",
      example: "function crearHucha() {\n  let dinero = 0;\n  return {\n    meter(n) { dinero += n; },\n    ver() { return dinero; },\n  };\n}\nconst h = crearHucha();\nh.meter(5);\nconsole.log(h.ver()); // 5",
    },
    task: "Escribe crearBoveda(clave): devuelve un objeto con el método abrir(intento). abrir devuelve true si intento es la clave, y false si no. Tras 3 fallos, la bóveda queda bloqueada y abrir siempre devuelve false.",
    starter: "function crearBoveda(clave) {\n  let fallos = 0;\n  return {\n    abrir(intento) {\n      // tu código\n    },\n  };\n}\n",
    borrowed: [],
    cases: [{ label: "intentos de esta noche", globals: () => ({}) }],
    capture: [],
    probe: fnProbe(
      "crearBoveda",
      '(() => { const v = crearBoveda("halley"); const w = crearBoveda("orion"); if (!v || typeof v.abrir !== "function") return "__noabrir"; return [v.abrir("x"), v.abrir("halley"), w.abrir("a"), w.abrir("b"), w.abrir("c"), w.abrir("orion"), v.abrir("halley")]; })()',
    ),
    check: ([o]) => {
      const p = o.values.__probe;
      const err = probeErr(o);
      if (p === "__nofn") return { pass: false, feedback: "No encuentro la función crearBoveda." };
      if (p === "__noabrir") return { pass: false, feedback: "crearBoveda debe devolver un objeto con un método abrir." };
      if (err) return { pass: false, feedback: `Tu bóveda falló: ${err}` };
      const got = p as unknown[];
      const want = [false, true, false, false, false, false, true];
      if (got.every((x) => x === undefined)) return { pass: false, feedback: "abrir no devuelve nada. Falta el return." };
      if (got[5] === true) return { pass: false, feedback: "Tras tres fallos la bóveda se abrió con la clave correcta. Debe quedar bloqueada: si fallos >= 3, return false." };
      if (got[6] === false && got[1] === true) return { pass: false, feedback: "Una bóveda bloqueó a la otra: los fallos deben ser de cada bóveda, dentro de crearBoveda." };
      if (!same(got, want)) return { pass: false, feedback: `Obtuve ${show(got)} y debía ser ${show(want)}.` };
      return { pass: true, feedback: "Bloqueada tras tres intentos. Las pruebas están a salvo." };
    },
    hints: [
      "Primero: si fallos >= 3, return false.",
      "Si intento === clave, return true. Si no, fallos++ y return false.",
      "function crearBoveda(clave) {\n  let fallos = 0;\n  return {\n    abrir(intento) {\n      if (fallos >= 3) return false;\n      if (intento === clave) return true;\n      fallos++;\n      return false;\n    },\n  };\n}",
    ],
    debrief: [
      { who: "sistema", text: "02:41 — BOVEDA BLOQUEADA TRAS 3 INTENTOS — origen: Hannover" },
      { who: "sam", text: "Lo intentó y no pudo. Ahora sabe que lo estamos mirando.", mood: "serio" },
    ],
    clue: { title: "La bóveda", text: "Intentaron borrar las pruebas desde Hannover. La bóveda aguantó." },
  },
];
