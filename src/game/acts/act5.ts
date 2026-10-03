// Acto 5 — "La conexión" (marzo de 1987): clases, métodos, this y herencia.
// El equipo modela la red de la llamada para coordinar la redada en Hannover.
import type { Mission } from "../types";
import { printed, probeErr, same, show } from "./util";

const classProbe = (name: string, expr: string) => `typeof ${name} !== "function" ? "__nocls" : (${expr})`;
const noClass = (p: unknown, name: string) =>
  p === "__nocls" ? { pass: false, feedback: `No encuentro la clase ${name}. Revisa el nombre: class ${name} { ... }` } : null;

export const ACT5: Mission[] = [
  {
    id: "m21",
    act: 5,
    title: "Planos de un nodo",
    concept: "Clases",
    phase: "dia",
    giver: "kessler",
    clock: "09:00",
    briefing: [
      { who: "kessler", text: "La policía alemana, la telefónica, el FBI, nosotros... Nadie se entiende. Cada uno dibuja la red a su manera." },
      { who: "kessler", text: "Quiero una plantilla única. Cada nodo de la red con los mismos datos, siempre igual." },
    ],
    lesson: {
      title: "Clases: plantillas para crear objetos",
      body: "Una clase es un molde. Su constructor recibe datos y los guarda en el objeto con this.propiedad = valor. Cada objeto nuevo se crea con new.",
      example: "class Estrella {\n  constructor(nombre, brillo) {\n    this.nombre = nombre;\n    this.brillo = brillo;\n  }\n}\nconst vega = new Estrella(\"Vega\", 0.03);\nconsole.log(vega.nombre); // Vega",
    },
    task: "Crea la clase `Nodo` con un `constructor(nombre, ciudad)` que guarde ambos en `this`. Después crea el nodo con `const lbl = new Nodo(\"LBL\", \"Berkeley\");` y muestra `lbl.ciudad`.",
    starter: "class Nodo {\n  // tu constructor aquí\n}\n\n",
    borrowed: [],
    cases: [{ label: "nodos de la red", globals: () => ({}) }],
    capture: [],
    probe: classProbe("Nodo", '(() => { const a = new Nodo("Tymnet", "Oakland"); return [a.nombre, a.ciudad]; })()'),
    check: ([o]) => {
      const p = o.values.__probe;
      const nc = noClass(p, "Nodo");
      if (nc) return nc;
      const err = probeErr(o);
      if (err) return { pass: false, feedback: `Al crear un Nodo falló: ${err}` };
      if (same(p, [undefined, undefined])) return { pass: false, feedback: "El nodo se crea vacío. En el constructor guarda los datos: this.nombre = nombre; this.ciudad = ciudad;" };
      if (!same(p, ["Tymnet", "Oakland"])) return { pass: false, feedback: `new Nodo("Tymnet", "Oakland") dio nombre y ciudad ${show(p)}. Revisa el orden de los parámetros.` };
      if (!printed(o, "Berkeley")) return { pass: false, feedback: 'La clase funciona. Falta crear lbl = new Nodo("LBL", "Berkeley") y mostrar lbl.ciudad.' };
      return { pass: true, feedback: "Un molde para todos. Kessler imprime cuarenta copias." };
    },
    hints: [
      "El constructor es una función especial dentro de la clase que recibe los datos al hacer new. Ahí los guardas en el objeto con this.",
      "Dentro del constructor: this.nombre = nombre; this.ciudad = ciudad;",
      'class Nodo {\n  constructor(nombre, ciudad) {\n    this.nombre = nombre;\n    this.ciudad = ciudad;\n  }\n}\n\nconst lbl = new Nodo("LBL", "Berkeley");\nconsole.log(lbl.ciudad);',
    ],
    debrief: [{ who: "kessler", text: "Por fin. Un dibujo que entiende hasta el FBI.", mood: "alegre" }],
    clue: { title: "Un solo mapa", text: "Todos usan la misma plantilla de nodo." },
  },
  {
    id: "m22",
    act: 5,
    title: "Que cada nodo se presente",
    concept: "Métodos y this",
    phase: "dia",
    giver: "ruth",
    clock: "11:40",
    briefing: [
      { who: "ruth", text: "La telefónica alemana pide los nodos en formato texto: nombre y ciudad entre paréntesis." },
      { who: "ruth", text: "Que cada nodo sepa describirse solo." },
    ],
    lesson: {
      title: "Métodos: funciones dentro de la clase",
      body: "Un método es una función que pertenece a la clase. Dentro, this es el objeto que lo está usando, así que this.nombre es el nombre de ese nodo en concreto.",
      example: "class Estrella {\n  constructor(nombre) {\n    this.nombre = nombre;\n  }\n  saludar() {\n    return `Soy ${this.nombre}`;\n  }\n}\nconsole.log(new Estrella(\"Vega\").saludar()); // Soy Vega",
    },
    task: "Añade a `Nodo` el método `describir()` que devuelva el texto \"NOMBRE (CIUDAD)\" con sus datos, por ejemplo \"LBL (Berkeley)\".",
    starter: "class Nodo {\n  constructor(nombre, ciudad) {\n    this.nombre = nombre;\n    this.ciudad = ciudad;\n  }\n  // añade describir() aquí\n}\n",
    borrowed: [],
    cases: [{ label: "nodos de la red", globals: () => ({}) }],
    capture: [],
    probe: classProbe("Nodo", '(() => { const a = new Nodo("Datex-P", "Bremen"); if (typeof a.describir !== "function") return "__nometh"; return [a.describir(), new Nodo("LBL", "Berkeley").describir()]; })()'),
    check: ([o]) => {
      const p = o.values.__probe;
      const nc = noClass(p, "Nodo");
      if (nc) return nc;
      if (p === "__nometh") return { pass: false, feedback: "Nodo no tiene el método describir(). Va dentro de la clase, después del constructor." };
      const err = probeErr(o);
      if (err) return { pass: false, feedback: /is not defined|Can't find variable/.test(err) ? "Dentro de un método, nombre a secas no existe. Los datos del nodo están en this: usa this.nombre y this.ciudad." : `describir() falló: ${err}` };
      const got = p as unknown[];
      if (got[0] === undefined) return { pass: false, feedback: "describir() no devuelve nada. Falta return." };
      if (String(got[0]).includes("undefined")) return { pass: false, feedback: `describir() devolvió "${got[0]}": alguna propiedad no existe. Escribe this.nombre y this.ciudad igual que en el constructor.` };
      if (!same(got, ["Datex-P (Bremen)", "LBL (Berkeley)"])) return { pass: false, feedback: `describir() devolvió ${show(got[0])}; debía ser "Datex-P (Bremen)". Ojo al espacio y a los paréntesis.` };
      return { pass: true, feedback: "Cada nodo se presenta solo." };
    },
    hints: [
      "describir() { return ... }",
      "Usa una plantilla con this: `${this.nombre} (${this.ciudad})`",
      "class Nodo {\n  constructor(nombre, ciudad) {\n    this.nombre = nombre;\n    this.ciudad = ciudad;\n  }\n  describir() {\n    return `${this.nombre} (${this.ciudad})`;\n  }\n}",
    ],
    debrief: [{ who: "ruth", text: "Se lo mandé por télex a Bremen. Me contestaron \"danke\". Creo que es bueno." }],
    clue: { title: "Télex", text: "Bremen y Berkeley ya hablan el mismo idioma de nodos." },
  },
  {
    id: "m23",
    act: 5,
    title: "La ruta completa",
    concept: "Estado en objetos",
    phase: "dia",
    giver: "ruth",
    clock: "13:10",
    briefing: [
      { who: "ruth", text: "Ahora la ruta entera de la llamada, de Hannover a Berkeley. Un objeto que vaya acumulando saltos." },
      { who: "ruth", text: "Que sepa añadir un salto y decir cuántos lleva." },
    ],
    lesson: {
      title: "Objetos que guardan y cambian datos",
      body: "Una clase puede guardar un array en this y sus métodos pueden modificarlo. Cada objeto tiene su propia copia.",
      example: "class Lista {\n  constructor() {\n    this.cosas = [];\n  }\n  poner(x) {\n    this.cosas.push(x);\n  }\n}\nconst l = new Lista();\nl.poner(\"cafe\");\nconsole.log(l.cosas.length); // 1",
    },
    task: "Crea la clase `Ruta`: el constructor empieza `this.saltos` como array vacío. El método `agregar(ciudad)` la añade a `saltos`, `total()` devuelve cuántos saltos hay y `ultimo()` devuelve la última ciudad añadida.",
    starter: "class Ruta {\n  constructor() {\n    this.saltos = [];\n  }\n  // agregar, total y ultimo aquí\n}\n",
    borrowed: [],
    cases: [{ label: "ruta de la llamada", globals: () => ({}) }],
    capture: [],
    probe: classProbe(
      "Ruta",
      '(() => { const r = new Ruta(); const s = new Ruta(); for (const m of ["agregar", "total", "ultimo"]) if (typeof r[m] !== "function") return "__nometh:" + m; r.agregar("Hannover"); r.agregar("Bremen"); r.agregar("Berkeley"); s.agregar("Oakland"); return [r.total(), r.ultimo(), s.total(), s.ultimo()]; })()',
    ),
    check: ([o]) => {
      const p = o.values.__probe;
      const nc = noClass(p, "Ruta");
      if (nc) return nc;
      if (typeof p === "string" && p.startsWith("__nometh:")) return { pass: false, feedback: `Falta el método ${p.split(":")[1]}() en Ruta.` };
      const err = probeErr(o);
      if (err) return { pass: false, feedback: `La ruta falló: ${err}` };
      const got = p as unknown[];
      if (got[0] === 4) return { pass: false, feedback: "Las dos rutas comparten saltos. El array debe crearse en el constructor con this.saltos = []." };
      if (!same(got, [3, "Berkeley", 1, "Oakland"])) return { pass: false, feedback: `Obtuve ${show(got)} y debía ser [3,"Berkeley",1,"Oakland"]. ultimo() es this.saltos[this.saltos.length - 1].` };
      return { pass: true, feedback: "Tres saltos, de Hannover a Berkeley, en un solo objeto." };
    },
    hints: [
      "Cada método trabaja con this.saltos: agregar lo llena con push, total pregunta su length y ultimo lee la última posición.",
      "total() { return this.saltos.length; }  ultimo() { return this.saltos[this.saltos.length - 1]; }",
      "class Ruta {\n  constructor() {\n    this.saltos = [];\n  }\n  agregar(ciudad) {\n    this.saltos.push(ciudad);\n  }\n  total() {\n    return this.saltos.length;\n  }\n  ultimo() {\n    return this.saltos[this.saltos.length - 1];\n  }\n}",
    ],
    debrief: [{ who: "sam", text: "Hannover, Bremen, el satélite, la costa este, Oakland, nosotros. Una cadena de favores que nadie pidió." }],
    clue: { title: "La cadena", text: "La ruta completa de la llamada, salto a salto." },
  },
  {
    id: "m24",
    act: 5,
    title: "Ficha del sospechoso",
    concept: "Herencia",
    phase: "dia",
    giver: "kessler",
    clock: "15:30",
    briefing: [
      { who: "kessler", text: "La policía alemana pide una ficha del sospechoso para la orden de registro." },
      { who: "kessler", text: "Ya tenemos la ficha de usuario normal. Él es un usuario... con extras." },
    ],
    lesson: {
      title: "Herencia: extends y super",
      body: "Una clase puede heredar de otra con extends: recibe todas sus propiedades y métodos, y puede añadir los suyos. En su constructor, super(...) llama al constructor de la clase madre.",
      example: "class Animal {\n  constructor(nombre) { this.nombre = nombre; }\n}\nclass Gato extends Animal {\n  constructor(nombre, color) {\n    super(nombre);       // la madre guarda el nombre\n    this.color = color;  // el gato añade lo suyo\n  }\n  maullar() { return `${this.nombre}: miau`; }\n}\nconsole.log(new Gato(\"Byte\", \"gris\").maullar()); // Byte: miau",
    },
    task: "La clase `Usuario` ya está en tu código. Crea `Intruso` que extienda `Usuario`: su `constructor(nombre, alias)` llama a `super(nombre)` y guarda el alias en `this.alias`. Añade el método `ficha()`, que devuelve el nombre tal cual, la palabra alias y el alias en mayúsculas (con `.toUpperCase()`). Por ejemplo, `new Intruso(\"E. Vogel\", \"hunter\").ficha()` devuelve \"E. Vogel alias HUNTER\".",
    starter: "class Usuario {\n  constructor(nombre) {\n    this.nombre = nombre;\n  }\n}\n\n// crea class Intruso extends Usuario aquí\n",
    borrowed: [],
    cases: [{ label: "fichas", globals: () => ({}) }],
    capture: [],
    probe: classProbe(
      "Intruso",
      '(() => { const i = new Intruso("E. Vogel", "hunter"); if (typeof i.ficha !== "function") return "__nometh"; return [i.nombre, i.alias, i.ficha(), typeof Usuario === "function" && i instanceof Usuario]; })()',
    ),
    check: ([o]) => {
      const p = o.values.__probe;
      const nc = noClass(p, "Intruso");
      if (nc) return nc;
      if (p === "__nometh") return { pass: false, feedback: "Intruso no tiene el método ficha()." };
      const err = probeErr(o);
      if (err) {
        if (/super/i.test(err)) return { pass: false, feedback: "En una clase que hereda hay que llamar a super(nombre) al principio del constructor, antes de usar this." };
        return { pass: false, feedback: `La ficha falló: ${err}` };
      }
      const got = p as unknown[];
      if (got[3] !== true) return { pass: false, feedback: "Intruso debe heredar de Usuario: class Intruso extends Usuario." };
      if (got[0] !== "E. Vogel") return { pass: false, feedback: "El nombre no se guardó: llama a super(nombre) en el constructor." };
      if (got[1] !== "hunter") return { pass: false, feedback: "Falta guardar el alias: this.alias = alias;" };
      if (got[2] === "E. Vogel alias hunter") return { pass: false, feedback: "Casi: el alias va en mayúsculas. this.alias.toUpperCase()" };
      if (got[2] !== "E. Vogel alias HUNTER") return { pass: false, feedback: `ficha() devolvió ${show(got[2])}; debía ser "E. Vogel alias HUNTER".` };
      return { pass: true, feedback: "Ficha lista. La orden de registro sale esta noche." };
    },
    hints: [
      "Primero la cabecera: class Intruso extends Usuario. Dentro, el constructor recibe nombre y alias, y lo primero que hace es super(nombre).",
      "ficha() { return `${this.nombre} alias ${this.alias.toUpperCase()}`; }",
      "class Usuario {\n  constructor(nombre) {\n    this.nombre = nombre;\n  }\n}\n\nclass Intruso extends Usuario {\n  constructor(nombre, alias) {\n    super(nombre);\n    this.alias = alias;\n  }\n  ficha() {\n    return `${this.nombre} alias ${this.alias.toUpperCase()}`;\n  }\n}",
    ],
    debrief: [
      { who: "kessler", text: "La policía entra mañana al amanecer, hora alemana. Es decir, esta noche para nosotros.", mood: "serio" },
      { who: "ruth", text: "Y tiene que estar conectado cuando entren. Si no, no hay pruebas." },
    ],
    clue: { title: "La orden", text: "Registro al amanecer en Hannover. Debe estar en línea." },
  },
  {
    id: "m25",
    act: 5,
    title: "Mantenerlo en línea",
    concept: "Clases en acción",
    phase: "noche",
    giver: "terminal",
    clock: "21:45",
    briefing: [
      { who: "narrador", text: "Marzo. Llueve. En Hannover son casi las siete de la mañana." },
      { who: "ruth", text: "Hay que darle algo que leer mientras la policía sube la escalera. Un archivo nuevo cada pocos minutos." },
      { who: "sam", text: "Una cola de señuelos: se van sirviendo de uno en uno, en orden, hasta que se acaben." },
    ],
    lesson: {
      title: "Una clase con varios métodos trabajando juntos",
      body: "Los métodos de una clase comparten this, así que uno puede preparar datos y otro consumirlos. shift() saca y devuelve el primer elemento de un array.",
      example: "const cola = [\"a\", \"b\"];\nconsole.log(cola.shift()); // a\nconsole.log(cola);         // [\"b\"]",
    },
    task: "Crea la clase `Senuelos`: `constructor(nombres)` guarda el array en `this.pendientes` y pone `this.servidos` en 0. El método `siguiente()` saca el primero de `pendientes` con `shift()`, suma 1 a `servidos` y lo devuelve; si no quedan, devuelve \"FIN\".",
    starter: "class Senuelos {\n  // tu código\n}\n",
    borrowed: [],
    cases: [{ label: "señuelos de la noche", globals: () => ({}) }],
    capture: [],
    probe: classProbe(
      "Senuelos",
      '(() => { const s = new Senuelos(["misiles.txt", "radares.txt"]); if (typeof s.siguiente !== "function") return "__nometh"; return [s.siguiente(), s.siguiente(), s.siguiente(), s.servidos]; })()',
    ),
    check: ([o]) => {
      const p = o.values.__probe;
      const nc = noClass(p, "Senuelos");
      if (nc) return nc;
      if (p === "__nometh") return { pass: false, feedback: "Falta el método siguiente()." };
      const err = probeErr(o);
      if (err) return { pass: false, feedback: `Los señuelos fallaron: ${err}` };
      const got = p as unknown[];
      if (got[0] === undefined) return { pass: false, feedback: "siguiente() no devuelve nada. Devuelve lo que saca shift()." };
      if (got[2] === undefined) return { pass: false, feedback: 'Cuando no quedan señuelos debe devolver "FIN". Comprueba this.pendientes.length === 0.' };
      if (got[3] === 3) return { pass: false, feedback: "servidos contó también el FIN. Suma solo cuando de verdad sirves un señuelo." };
      if (!same(got, ["misiles.txt", "radares.txt", "FIN", 2])) return { pass: false, feedback: `Obtuve ${show(got)} y debía ser ["misiles.txt","radares.txt","FIN",2].` };
      return { pass: true, feedback: "Un señuelo tras otro. Sigue leyendo." };
    },
    hints: [
      "constructor(nombres) { this.pendientes = nombres; this.servidos = 0; }",
      "En siguiente(), primero pregunta si this.pendientes está vacío (length === 0): entonces devuelve \"FIN\". Si no, suma 1 a this.servidos y devuelve lo que saca shift().",
      'class Senuelos {\n  constructor(nombres) {\n    this.pendientes = nombres;\n    this.servidos = 0;\n  }\n  siguiente() {\n    if (this.pendientes.length === 0) return "FIN";\n    this.servidos++;\n    return this.pendientes.shift();\n  }\n}',
    ],
    debrief: [
      { who: "sistema", text: "22:07 — hunter abre radares.txt" },
      { who: "sistema", text: "22:09 — CONEXION CORTADA EN ORIGEN" },
      { who: "ruth", text: "Se cortó en Hannover. No lo cortó él." },
      { who: "sam", text: "Lo cortaron ellos. La policía está dentro.", mood: "sorpresa" },
    ],
    clue: { title: "Redada", text: "La conexión se corta en origen: la policía entró en Hannover." },
  },
];
