// Diez días — Mountain View, mayo de 1995. Nébula Communications tiene diez días
// para enseñar una beta de su navegador en la que las páginas "cobran vida".
// Lena prueba el nuevo lenguaje de guiones sobre páginas de verdad: seleccionar y
// cambiar elementos (acto 1), responder a la persona (acto 2) y construir la demo
// (acto 3). Todas las misiones corren sobre una página (sandbox "dom").
import type { StoryContent, StoryMission } from "../types";
import type { RunOutput } from "../../game/sandbox";
import type { CheckResult, TestCase } from "../../game/types";

// ---------- páginas de 1995 ----------

const CSS = [
  'body{background:#c0c0c0;font-family:"Times New Roman",Times,serif;color:#000;margin:16px;line-height:1.3}',
  "a{color:#0000ee;text-decoration:underline}",
  "h1{font-size:30px;margin:6px 0}",
  "h2{font-size:22px;margin:10px 0 4px}",
  "hr{border:0;border-top:2px groove #fff;margin:10px 0}",
  "table{background:#fff;border:2px outset #fff}",
  "td,th{border:1px inset #808080;padding:3px 8px}",
  "button,input{font-family:inherit;font-size:15px}",
  ".obras{display:inline-block;padding:5px 12px;background:repeating-linear-gradient(45deg,#ffd800 0 10px,#000 10px 20px);border:2px outset #fff}",
  ".obras span{background:#ffd800;padding:0 6px;font:bold 12px Arial,sans-serif;letter-spacing:1px}",
  ".pie{font-size:13px}",
  ".oculto{display:none}",
].join("");

const OBRAS = '<p><span class="obras"><span>PAGINA EN CONSTRUCCION</span></span></p>';
const PIE = (txt: string) => `<hr><p class="pie">${txt} | <a href="#">Volver al inicio</a></p>`;

const pagina = (titulo: string, cuerpo: string, css = "") =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${titulo}</title><style>${CSS}${css}</style></head><body>${cuerpo}</body></html>`;

const caso = (label: string, html: string): TestCase => ({ label, globals: () => ({ __html: html }) });

// ---------- ayudas para corregir ----------

type P = Record<string, unknown>;
const ok = (feedback: string): CheckResult => ({ pass: true, feedback });
const no = (feedback: string): CheckResult => ({ pass: false, feedback });

/** Lee lo que devolvió la sonda, o el motivo por el que no se pudo probar la página. */
function leer(o: RunOutput): P | string {
  if (!o.ok) return `Tu código dio un error: ${o.error?.message ?? "desconocido"}.`;
  const p = o.values.__probe as P | undefined;
  if (p && typeof p === "object" && "__err" in p) return `Al probar la página pasó esto: ${String(p.__err)}.`;
  return p ?? {};
}

const logged = (o: RunOutput, s: string) => o.logs.some((l) => l.trim() === s);

const STARTER = "// Escribe tu código debajo de esta línea\n";

// ---------- datos de los casos ----------

const TITULOS = ["Página de Prueba", "Mi primera página web"];
const OFERTAS = [
  { texto: "Nébula 0.9: ahora con tablas de colores", clase: "" },
  { texto: "Nuevo: fondos con textura de mármol", clase: "grande" },
];
const LOGOS = ["logo.gif", "nebula95.gif"];
const PRODUCTOS = [
  [
    ["Nébula Navegador", "$39.00"],
    ["Nébula Correo", "$19.00"],
    ["Manual impreso", "$12.50"],
  ],
  [
    ["Nébula Navegador", "$39.00"],
    ["Nébula Servidor", "$995.00"],
    ["Nébula Correo", "$19.00"],
    ["Camiseta oficial", "$15.00"],
    ["Disquetes de instalación", "$5.00"],
  ],
];
const CONTADORES = [1994, 41];
const NOVEDADES = [["Abrimos la página"], ["Abrimos la página", "Wes cambió el fondo otra vez"]];
const NUEVAS = ["Ahora con JavaScript", "Botones que responden", "Nébula 1.0 beta"];
const PENDIENTES = [
  ["Arreglar el gif del cohete", "Probar en el monitor de Kraus", "Quitar el fondo de mármol"],
  ["Subir la foto del equipo", "Revisar los enlaces rotos", "Pedir más café", "Cambiar el color del titular"],
];
const CORREOS = ["", "wes@nebula.com"];
const DEMO = [
  [
    "Nébula 1.0 beta: el navegador que se mueve",
    "JavaScript: páginas que responden",
    "Nuevo contador de visitas",
    "Botones que hacen cosas",
    "Guía de JavaScript para diseñadores",
  ],
  [
    "El navegador más rápido de 1995",
    "Formularios que avisan si falta algo",
    "JavaScript llega a Nébula",
    "Atajos de teclado",
    "Listas que crecen solas",
    "Descarga la beta del navegador",
  ],
];

// ---------- misiones ----------

const missions: StoryMission[] = [
  // ===== Acto 1: Tocar la página =====
  {
    id: "dd1",
    act: 1,
    title: "Hola, página",
    concept: "querySelector y textContent",
    sandbox: "dom",
    giver: "kraus",
    briefing: [
      { who: "kraus", text: "Día uno. Quedan diez días. Primera prueba: que el guion encuentre algo en la página y lo cambie." },
      { who: "kraus", text: "La página de pruebas tiene un titular viejo. Léelo, para que conste, y que diga «Bienvenido a Nébula»." },
      { who: "lena", text: "¿Cambiarlo sin tocar el archivo de la página?", mood: "sorpresa" },
      { who: "kraus", text: "Sin tocarlo. Desde el guion. Eso es lo que vendemos.", mood: "alegre" },
    ],
    lesson: {
      title: "El DOM: la página como un árbol",
      body: "El navegador convierte la página en un árbol de elementos que JavaScript puede tocar: se llama el DOM, y la puerta de entrada es `document`. `document.querySelector(\"#pie\")` devuelve el primer elemento que coincide: con `#` buscas por id, y sin nada por etiqueta (`\"h1\"`). Su texto está en `.textContent`: puedes leerlo y también cambiarlo con `=`.",
      example: 'let pie = document.querySelector("#pie");\nconsole.log(pie.textContent); // Hecho en 1995\npie.textContent = "Hecho por Lena";',
    },
    task: "Guarda en la variable `titular` el elemento `#titular` con `document.querySelector`. Muestra con `console.log` el texto que tiene ahora (`titular.textContent`) y después cámbialo a \"Bienvenido a Nébula\".",
    starter: STARTER,
    borrowed: [],
    cases: TITULOS.map((t, i) =>
      caso(
        i === 0 ? "página de pruebas" : "página de un cliente",
        pagina(
          t,
          `<h1 id="titular">${t}</h1>${OBRAS}<p>Esta página se ve mejor con <a href="#">Nébula</a> a 640 x 480.</p>${PIE("Actualizada el 15 de mayo de 1995")}`,
        ),
      ),
    ),
    capture: [],
    probe: '({ t: __text("#titular"), h1: __count("h1") })',
    check: (outs) => {
      for (let i = 0; i < outs.length; i++) {
        const o = outs[i];
        const p = leer(o);
        if (typeof p === "string") return no(p);
        const antes = TITULOS[i];
        if (p.h1 === 0) return no("La página se quedó sin titular. Cambia solo su texto con titular.textContent = ...");
        if (p.t === antes)
          return no(`El titular sigue diciendo «${antes}». Asígnale el texto nuevo: titular.textContent = "Bienvenido a Nébula".`);
        if (p.t !== "Bienvenido a Nébula")
          return no(`El titular debería decir «Bienvenido a Nébula» y dice «${String(p.t)}». Revisa la tilde y las mayúsculas.`);
        if (i > 0 && logged(o, TITULOS[0]))
          return no(`En la otra página mostraste «${TITULOS[0]}», pero ahí el titular era «${antes}». Léelo con titular.textContent, no lo escribas a mano.`);
        if (!logged(o, antes)) {
          if (logged(o, "Bienvenido a Nébula"))
            return no("Mostraste el titular después de cambiarlo. Pon el console.log antes, para que se vea el texto viejo.");
          return no("El titular ya cambia. Falta mostrar el texto que tenía antes con console.log(titular.textContent).");
        }
      }
      return ok("El guion encontró el titular y lo cambió. La página obedece.");
    },
    hints: [
      "Primero busca el elemento: document.querySelector(\"#titular\"). Guárdalo en una variable.",
      "Lee con console.log(titular.textContent) y luego cambia con titular.textContent = \"...\". El orden importa.",
      'let titular = document.querySelector("#titular");\nconsole.log(titular.textContent);\ntitular.textContent = "Bienvenido a Nébula";',
    ],
    debrief: [
      { who: "kraus", text: "¡Cambió! Sin recargar, sin tocar el archivo. Eso vale una portada de revista.", mood: "alegre" },
      { who: "kraus", text: "Wes te va a pedir cosas. Muchas. Dile que sí a casi todo." },
    ],
  },
  {
    id: "dd2",
    act: 1,
    title: "Que se note",
    concept: "classList y style",
    sandbox: "dom",
    giver: "wes",
    briefing: [
      { who: "wes", text: "Hola, soy Wes. Diseño la página de inicio. El pelo es azul eléctrico, por si preguntabas." },
      { who: "wes", text: "Tengo una oferta que nadie lee. Ya dejé preparada una clase parpadeo en el estilo de la página." },
      { who: "wes", text: "Ponle esa clase a la oferta y píntala de rojo. Rojo de verdad, no rojo tímido.", mood: "alegre" },
    ],
    lesson: {
      title: "Clases y estilos desde el guion",
      body: "Las clases son etiquetas que el estilo de la página usa para decidir cómo se ve algo; un elemento puede tener varias. `elemento.classList.add(\"nombre\")` le suma una sin quitar las que ya tenía. Para cambiar un estilo suelto usa `elemento.style`: `elemento.style.color = \"blue\"` o `elemento.style.fontSize = \"20px\"`.",
      example: 'let aviso = document.querySelector("#aviso");\naviso.classList.add("importante");\naviso.style.fontSize = "20px";',
    },
    task: "Busca `#oferta`, añádele la clase \"parpadeo\" con `classList.add` (sin quitarle las clases que ya tenga) y pon su `style.color` en \"red\". No cambies su texto.",
    starter: STARTER,
    borrowed: [],
    cases: OFERTAS.map((of, i) =>
      caso(
        i === 0 ? "oferta de la portada" : "oferta con clase grande",
        pagina(
          "Inicio de Nébula",
          `<h1>Nébula Communications</h1><hr><p id="oferta"${of.clase ? ` class="${of.clase}"` : ""}>${of.texto}</p><p>Descarga gratis la versión de prueba en <a href="#">nuestro servidor</a>.</p>${OBRAS}${PIE("Diseño: Wes")}`,
          "@keyframes parpadeo{50%{visibility:hidden}}.parpadeo{animation:parpadeo 1s steps(1) infinite;font-weight:bold}.grande{font-size:22px}",
        ),
      ),
    ),
    capture: [],
    probe: '(() => { const e = document.querySelector("#oferta"); return e ? { clases: e.className, color: e.style.color, t: __text("#oferta") } : { falta: true }; })()',
    check: (outs) => {
      for (let i = 0; i < outs.length; i++) {
        const p = leer(outs[i]);
        if (typeof p === "string") return no(p);
        if (p.falta) return no("La oferta desapareció de la página. Solo hay que cambiarle la clase y el color.");
        const of = OFERTAS[i];
        const clases = String(p.clases ?? "").split(/\s+/).filter(Boolean);
        if (!clases.includes("parpadeo"))
          return no("La oferta no tiene la clase parpadeo. Añádela con oferta.classList.add(\"parpadeo\").");
        if (of.clase && !clases.includes(of.clase))
          return no(`En esta página la oferta ya tenía la clase ${of.clase} y se perdió. Usa classList.add, que suma sin borrar las demás.`);
        if (p.color !== "red")
          return no(p.color ? `El color es «${String(p.color)}» y Wes lo quiere «red».` : "Falta el color: oferta.style.color = \"red\".");
        if (p.t !== of.texto) return no(`La oferta debía seguir diciendo «${of.texto}». No cambies su texto.`);
      }
      return ok("Parpadea en rojo. Wes está conmovido.");
    },
    hints: [
      "Guarda el elemento: let oferta = document.querySelector(\"#oferta\");",
      "Son dos líneas más: una con oferta.classList.add(...) y otra con oferta.style.color = ...",
      'let oferta = document.querySelector("#oferta");\noferta.classList.add("parpadeo");\noferta.style.color = "red";',
    ],
    debrief: [
      { who: "wes", text: "Míralo. Parpadea. Es lo más bonito que he visto este año.", mood: "alegre" },
      { who: "lena", text: "Es un poco molesto, Wes." },
      { who: "wes", text: "Esa es la idea. Lo molesto se lee." },
    ],
  },
  {
    id: "dd3",
    act: 1,
    title: "Las fotos se mudan",
    concept: "getAttribute y setAttribute",
    sandbox: "dom",
    giver: "wes",
    briefing: [
      { who: "wes", text: "Problema: alguien ordenó el servidor y metió todas las imágenes en la carpeta imagenes/. El logo se rompió." },
      { who: "wes", text: "Cada página tiene su logo con su propio nombre de archivo. Que el guion lea la ruta y le ponga la carpeta delante." },
      { who: "wes", text: "Y que tenga texto alternativo, por si alguien navega con módem de 14.4 y desactiva las fotos.", mood: "serio" },
    ],
    lesson: {
      title: "Atributos: lo que va dentro de la etiqueta",
      body: "En `<img src=\"gato.gif\" alt=\"Un gato\">`, `src` y `alt` son atributos: datos que van dentro de la etiqueta. `elemento.getAttribute(\"src\")` lee uno y devuelve su texto. `elemento.setAttribute(\"alt\", \"Otro texto\")` le pone un valor nuevo. Como el valor es texto, puedes unirlo con otro usando `+`.",
      example: 'let enlace = document.querySelector("#descarga");\nconsole.log(enlace.getAttribute("href")); // beta.zip\nenlace.setAttribute("href", "ftp/" + "beta.zip");',
    },
    task: "Busca la imagen `#logo`. Lee su `src` con `getAttribute` y cámbialo con `setAttribute` a \"imagenes/\" seguido de ese mismo nombre (por ejemplo, logo.gif pasa a imagenes/logo.gif). Pon también su `alt` en \"Logo de Nébula\".",
    starter: STARTER,
    borrowed: [],
    cases: LOGOS.map((src, i) =>
      caso(
        i === 0 ? "página de inicio" : "página de prensa",
        pagina(
          i === 0 ? "Inicio" : "Prensa",
          `<table><tr><td><img id="logo" src="${src}" alt="" width="88" height="31"></td><td><b>${i === 0 ? "Nébula Communications" : "Sala de prensa de Nébula"}</b></td></tr></table><hr><p>Imagen: <code>${src}</code></p>${OBRAS}${PIE("Mejor con Nébula")}`,
          "img{background:#fff;border:2px inset #808080}",
        ),
      ),
    ),
    capture: [],
    probe: '(() => { const e = document.querySelector("#logo"); return e ? { src: e.getAttribute("src"), alt: e.getAttribute("alt") } : { falta: true }; })()',
    check: (outs) => {
      for (let i = 0; i < outs.length; i++) {
        const p = leer(outs[i]);
        if (typeof p === "string") return no(p);
        if (p.falta) return no("La imagen #logo desapareció. Solo hay que cambiar sus atributos.");
        const quiere = "imagenes/" + LOGOS[i];
        if (p.src === LOGOS[i]) return no(`El src sigue siendo «${LOGOS[i]}». Cámbialo con logo.setAttribute("src", ...).`);
        if (p.src !== quiere) {
          if (i > 0 && p.src === "imagenes/" + LOGOS[0])
            return no(`En la página de prensa el logo se llama «${LOGOS[i]}» y le pusiste «${String(p.src)}». Usa el valor que lees con getAttribute, no lo escribas a mano.`);
          if (p.src === "imagenes/") return no("El src quedó en «imagenes/» a secas. Le falta el nombre del archivo que leíste con getAttribute.");
          if (p.src === "imagenes" + LOGOS[i]) return no(`Quedó «${String(p.src)}»: falta la barra / después de imagenes.`);
          return no(`El src debería ser «${quiere}» y es «${String(p.src)}».`);
        }
        if (p.alt !== "Logo de Nébula")
          return no(p.alt ? `El alt dice «${String(p.alt)}» y debería decir «Logo de Nébula».` : "La ruta ya está bien. Falta el alt: logo.setAttribute(\"alt\", \"Logo de Nébula\").");
      }
      return ok("Los logos encontraron su nueva casa.");
    },
    hints: [
      "Lee la ruta actual y guárdala: let ruta = logo.getAttribute(\"src\");",
      "La ruta nueva es \"imagenes/\" + ruta. Pásala a logo.setAttribute(\"src\", ...). El alt va con otro setAttribute.",
      'let logo = document.querySelector("#logo");\nlet ruta = logo.getAttribute("src");\nlogo.setAttribute("src", "imagenes/" + ruta);\nlogo.setAttribute("alt", "Logo de Nébula");',
    ],
    debrief: [
      { who: "wes", text: "Una línea de guion y todas las páginas arregladas. Me acabas de ahorrar un fin de semana.", mood: "alegre" },
      { who: "kraus", text: "Quedan ocho días. Lena, ven a mi despacho. Tengo una idea de vendedor." },
    ],
  },
  {
    id: "dd4",
    act: 1,
    title: "La beta es gratis",
    concept: "querySelectorAll y forEach",
    sandbox: "dom",
    giver: "kraus",
    briefing: [
      { who: "kraus", text: "Quedan ocho días. Decisión de última hora: la beta se regala. Gratis. Que nos descargue todo el planeta." },
      { who: "kraus", text: "Pero la tienda tiene precios por todas partes. Y cada tienda tiene distintos productos." },
      { who: "kraus", text: "Cada celda de precio, que diga GRATIS. Y dime cuántas cambiaste, para el informe.", mood: "alegre" },
    ],
    lesson: {
      title: "Muchos elementos a la vez",
      body: "`document.querySelectorAll(\".nombre\")` devuelve una lista con TODOS los elementos que coinciden (el punto busca por clase). La lista tiene `.length` y se recorre con `forEach`, que llama a tu función una vez por cada elemento. Ojo: `querySelector`, sin All, solo devuelve el primero.",
      example: 'let notas = document.querySelectorAll(".nota");\nconsole.log(notas.length); // 2\nnotas.forEach((nota) => {\n  nota.style.color = "blue";\n});',
    },
    task: "Guarda en `precios` todos los elementos con la clase `precio` usando `querySelectorAll`. Con `forEach`, cambia el texto de cada uno a \"GRATIS\". Después muestra cuántos hay con `console.log(precios.length)`.",
    starter: STARTER,
    borrowed: [],
    cases: PRODUCTOS.map((filas, i) =>
      caso(
        i === 0 ? "tienda de la oficina" : "tienda para empresas",
        pagina(
          "Tienda Nébula",
          `<h1>Tienda Nébula</h1><p>Pague con cheque o tarjeta. Envíos en disquete.</p><table><tr><th>Producto</th><th>Precio</th></tr>${filas
            .map(([n, pr]) => `<tr><td class="producto">${n}</td><td class="precio">${pr}</td></tr>`)
            .join("")}</table>${OBRAS}${PIE("Precios en dólares")}`,
          ".precio{text-align:right;color:#800000}",
        ),
      ),
    ),
    capture: [],
    probe: '({ n: __count(".precio"), gratis: [...document.querySelectorAll(".precio")].filter((e) => e.textContent.trim() === "GRATIS").length, productos: __count(".producto") })',
    check: (outs) => {
      for (let i = 0; i < outs.length; i++) {
        const o = outs[i];
        const p = leer(o);
        if (typeof p === "string") return no(p);
        const total = PRODUCTOS[i].length;
        if (p.n !== total || p.productos !== total)
          return no(`La tabla debía seguir teniendo ${total} filas de precio. Cambia solo el texto de cada celda.`);
        if (p.gratis === 0) return no("Ningún precio dice GRATIS todavía. Dentro del forEach, cambia el textContent de cada uno.");
        if (p.gratis === 1 && total > 1)
          return no(`Solo cambiaste 1 de ${total} precios. querySelector devuelve el primero; para todos se usa querySelectorAll.`);
        if (p.gratis !== total) return no(`Cambiaste ${String(p.gratis)} de ${total} precios. Deben decir GRATIS todos.`);
        if (!logged(o, String(total))) {
          const otro = o.logs.find((l) => /^\d+$/.test(l.trim()));
          if (otro) return no(`Esta tienda tiene ${total} precios y mostraste ${otro.trim()}. Usa precios.length en vez de escribir el número.`);
          return no("Todos dicen GRATIS. Falta mostrar cuántos con console.log(precios.length).");
        }
      }
      return ok("Todo gratis. Kraus ya está ensayando el titular de prensa.");
    },
    hints: [
      "let precios = document.querySelectorAll(\".precio\"); te da la lista entera.",
      "precios.forEach((precio) => { precio.textContent = \"GRATIS\"; }); y al final el console.log.",
      'let precios = document.querySelectorAll(".precio");\nprecios.forEach((precio) => {\n  precio.textContent = "GRATIS";\n});\nconsole.log(precios.length);',
    ],
    debrief: [
      { who: "kraus", text: "¡Gratis! La palabra más bonita del marketing. Después les cobraremos el servidor.", mood: "alegre" },
      { who: "lena", text: "Hasta ahora el guion cambia la página una vez y ya. No responde a nadie." },
      { who: "kraus", text: "Exacto. Eso es lo que nos falta. Quedan siete días." },
    ],
  },

  // ===== Acto 2: Que reaccione =====
  {
    id: "dd5",
    act: 2,
    title: "El contador de Wes",
    concept: "addEventListener (click)",
    sandbox: "dom",
    giver: "wes",
    briefing: [
      { who: "wes", text: "Mi orgullo: el contador de visitas. Ahora mismo es un número pintado. Lo cambio yo a mano cada mañana.", mood: "serio" },
      { who: "wes", text: "Quiero que cada clic en el botón de firmar sume uno. Desde el número que marque, no desde cero." },
      { who: "lena", text: "Entonces la página tiene que esperar a que alguien haga clic." },
    ],
    lesson: {
      title: "Escuchar: addEventListener",
      body: "`elemento.addEventListener(\"click\", () => { ... })` deja una función esperando: no se ejecuta ahora, sino cada vez que alguien hace clic en ese elemento. Dentro va lo que debe pasar en cada clic. Recuerda que `textContent` siempre es texto: para sumar, conviértelo antes con `Number(...)`.",
      example: 'let puntos = document.querySelector("#puntos");\nlet boton = document.querySelector("#doble");\nboton.addEventListener("click", () => {\n  puntos.textContent = Number(puntos.textContent) * 2;\n});',
    },
    task: "Cuando se haga clic en el botón `#visitar`, el número que muestra `#contador` debe subir en uno. Cada página empieza con un número distinto: lee el que hay.",
    starter: STARTER,
    borrowed: [],
    cases: CONTADORES.map((n, i) =>
      caso(
        i === 0 ? "página de Wes" : "página del primo de Wes",
        pagina(
          i === 0 ? "La página de Wes" : "El rincón de Ted",
          `<h1>${i === 0 ? "La página de Wes" : "El rincón de Ted"}</h1>${OBRAS}<p>Eres el visitante número <b id="contador">${n}</b></p><p><button id="visitar">Firmar visita</button></p>${PIE("Gracias por pasar")}`,
          "#contador{font:bold 20px Courier New,monospace;background:#000;color:#0f0;padding:2px 6px}",
        ),
      ),
    ),
    capture: [],
    probe:
      '(() => { const antes = __text("#contador"); __click("#visitar"); const uno = __text("#contador"); __click("#visitar"); __click("#visitar"); return { antes, uno, tres: __text("#contador") }; })()',
    check: (outs) => {
      for (let i = 0; i < outs.length; i++) {
        const p = leer(outs[i]);
        if (typeof p === "string") return no(p);
        const n = CONTADORES[i];
        if (p.antes !== String(n))
          return no(`Antes de cualquier clic el contador ya decía ${String(p.antes)}. El cambio va dentro de la función del addEventListener.`);
        if (p.uno === String(n))
          return no("Hice clic en #visitar y el contador no cambió. ¿Escuchas el evento \"click\" en el botón #visitar?");
        if (p.uno === `${n}1`)
          return no(`Tras un clic marca ${String(p.uno)}: se pegó un 1 al final porque textContent es texto. Conviértelo con Number(...) antes de sumar.`);
        if (p.uno === "1") return no(`Tras un clic marca 1. Tenía que seguir desde ${n}: lee el número que ya muestra la página.`);
        if (p.uno !== String(n + 1)) return no(`Tras un clic debería marcar ${n + 1} y marca ${String(p.uno)}.`);
        if (p.tres !== String(n + 3))
          return no(`Tras tres clics debería marcar ${n + 3} y marca ${String(p.tres)}. Lee el número del contador en cada clic, dentro de la función.`);
      }
      return ok("Cada clic suma uno. El contador está vivo.");
    },
    hints: [
      "Busca los dos elementos y escucha el clic: boton.addEventListener(\"click\", () => { ... });",
      "Dentro de la función: contador.textContent = Number(contador.textContent) + 1;",
      'let contador = document.querySelector("#contador");\nlet boton = document.querySelector("#visitar");\nboton.addEventListener("click", () => {\n  contador.textContent = Number(contador.textContent) + 1;\n});',
    ],
    debrief: [
      { who: "wes", text: "Hice clic cuarenta veces. Cuarenta visitas. Mi página nunca había sido tan popular.", mood: "alegre" },
      { who: "kraus", text: "Eso no cuenta, Wes. Pero la demo sí. Lena, la página de producto es eterna. Hay que esconder cosas." },
    ],
  },
  {
    id: "dd6",
    act: 2,
    title: "Ver más, ver menos",
    concept: "classList.toggle",
    sandbox: "dom",
    giver: "kraus",
    briefing: [
      { who: "kraus", text: "Quedan seis días. La ficha del producto tiene un párrafo técnico larguísimo. Los clientes huyen." },
      { who: "kraus", text: "Que esté escondido. Un botón lo muestra y el mismo botón lo vuelve a esconder. Y que el botón diga lo que va a hacer." },
    ],
    lesson: {
      title: "Alternar una clase",
      body: "`classList.toggle(\"nombre\")` pone la clase si no la tiene y la quita si la tiene: perfecto para un interruptor. Para preguntar si la tiene ahora, `classList.contains(\"nombre\")` devuelve `true` o `false`, y lo puedes usar en un `if`.",
      example: 'let luz = document.querySelector("#luz");\nluz.classList.toggle("encendida");\nconsole.log(luz.classList.contains("encendida")); // true',
    },
    task: "Los detalles `#detalles` empiezan con la clase \"oculto\". Cuando se haga clic en `#ver-mas`, alterna esa clase con `classList.toggle`. Después, si `#detalles` tiene la clase \"oculto\", el botón dice \"Ver más\"; si no, dice \"Ver menos\".",
    starter: STARTER,
    borrowed: [],
    cases: [
      caso(
        "ficha del navegador",
        pagina(
          "Nébula Navegador",
          `<h1>Nébula Navegador 1.0</h1><p>El navegador que hace que las páginas cobren vida.</p><p><button id="ver-mas">Ver más</button></p><div id="detalles" class="oculto"><p>Requiere 4 MB de memoria, Windows 3.1 o System 7 y un módem de 9600 baudios o más.</p></div>${PIE("Ficha técnica")}`,
        ),
      ),
      caso(
        "ficha del servidor",
        pagina(
          "Nébula Servidor",
          `<h1>Nébula Servidor</h1><p>Su empresa en la web, en una tarde.</p><p><button id="ver-mas">Ver más</button></p><div id="detalles" class="oculto"><p>Funciona en estaciones de trabajo con 16 MB de memoria. Incluye manual de 300 páginas.</p></div>${OBRAS}${PIE("Ficha técnica")}`,
        ),
      ),
    ],
    capture: [],
    probe:
      '(() => { const s = () => ({ oculto: document.querySelector("#detalles").classList.contains("oculto"), boton: __text("#ver-mas") }); const a = s(); __click("#ver-mas"); const b = s(); __click("#ver-mas"); const c = s(); return { a, b, c }; })()',
    check: (outs) => {
      for (const o of outs) {
        const p = leer(o);
        if (typeof p === "string") return no(p);
        const a = p.a as P, b = p.b as P, c = p.c as P;
        if (!a.oculto) return no("Los detalles se ven antes de hacer clic. Al cargar deben seguir ocultos: el toggle va dentro de la función del clic.");
        if (b.oculto) return no("Hice clic en #ver-mas y los detalles siguen ocultos. Alterna la clase con detalles.classList.toggle(\"oculto\").");
        if (!c.oculto)
          return no("Al segundo clic los detalles deberían ocultarse otra vez. Usa toggle, que pone y quita; remove solo quita.");
        if (b.boton !== "Ver menos") return no(`Con los detalles a la vista el botón debería decir «Ver menos» y dice «${String(b.boton)}».`);
        if (c.boton !== "Ver más") return no(`Con los detalles ocultos el botón debería decir «Ver más» y dice «${String(c.boton)}».`);
      }
      return ok("Se abre, se cierra y el botón no miente.");
    },
    hints: [
      "Dentro del addEventListener del botón: detalles.classList.toggle(\"oculto\");",
      "Después del toggle: if (detalles.classList.contains(\"oculto\")) { boton.textContent = \"Ver más\"; } else { ... }",
      'let boton = document.querySelector("#ver-mas");\nlet detalles = document.querySelector("#detalles");\nboton.addEventListener("click", () => {\n  detalles.classList.toggle("oculto");\n  if (detalles.classList.contains("oculto")) {\n    boton.textContent = "Ver más";\n  } else {\n    boton.textContent = "Ver menos";\n  }\n});',
    ],
    debrief: [
      { who: "kraus", text: "Limpio. Un cliente ve poco, hace clic y siente que descubrió algo. Eso es vender.", mood: "alegre" },
      { who: "wes", text: "Lena, cuando acabes con él, tengo una idea para mi libro de visitas." },
    ],
  },
  {
    id: "dd7",
    act: 2,
    title: "El libro de visitas",
    concept: "evento input y value",
    sandbox: "dom",
    giver: "wes",
    briefing: [
      { who: "wes", text: "Quedan cinco días, según Kraus. Según yo, quedan cinco días para que mi libro de visitas sea legendario." },
      { who: "wes", text: "Mientras alguien escribe su nombre, debajo aparece cómo quedará la firma. Letra a letra. Como magia.", mood: "alegre" },
    ],
    lesson: {
      title: "Leer lo que escribe una persona",
      body: "Lo que hay escrito en un campo `<input>` está en su propiedad `.value`. El evento `\"input\"` salta cada vez que cambia ese texto, letra a letra. Lee `.value` dentro de la función del evento: fuera, se leería una sola vez, antes de que nadie escriba.",
      example: 'let ciudad = document.querySelector("#ciudad");\nciudad.addEventListener("input", () => {\n  console.log(ciudad.value); // lo que va escrito\n});',
    },
    task: "Cada vez que cambie el texto del campo `#firma` (evento \"input\"), el elemento `#vista` debe decir \"Firmado por: \" seguido de lo que hay escrito en el campo.",
    starter: STARTER,
    borrowed: [],
    cases: [
      caso(
        "libro de visitas de Wes",
        pagina(
          "Libro de visitas",
          `<h1>Libro de visitas</h1><p>Deja tu nombre. Wes lee todas las firmas.</p><p>Nombre: <input id="firma" size="30"></p><p><i id="vista">Nadie ha firmado todavía.</i></p>${PIE("Firmas: 12")}`,
        ),
      ),
      caso(
        "libro de visitas de la oficina",
        pagina(
          "Firmas de Nébula",
          `<h1>Firmas de la oficina</h1>${OBRAS}<table><tr><td>Tu nombre</td><td><input id="firma"></td></tr></table><p>Así quedará: <b id="vista"></b></p>${PIE("Firmas: 3")}`,
        ),
      ),
    ],
    capture: [],
    probe:
      '(() => { const r = []; for (const t of ["L", "Lena", "Gus del cuarto piso"]) { __type("#firma", t); r.push(__text("#vista")); } return { r }; })()',
    check: (outs) => {
      const textos = ["L", "Lena", "Gus del cuarto piso"];
      for (const o of outs) {
        const p = leer(o);
        if (typeof p === "string") return no(p);
        const r = (p.r as unknown[]) ?? [];
        for (let k = 0; k < textos.length; k++) {
          const quiere = `Firmado por: ${textos[k]}`;
          if (r[k] === quiere) continue;
          if (r[k] === "Firmado por:" || r[k] === "Firmado por: ")
            return no(`Escribí «${textos[k]}» y la vista dice «Firmado por:» sin nombre. Lee firma.value dentro de la función del evento, no fuera.`);
          if (k === 0 && !String(r[k] ?? "").startsWith("Firmado"))
            return no(`Escribí «${textos[k]}» en #firma y la vista no cambió. Escucha el evento "input" del campo #firma.`);
          return no(`Al escribir «${textos[k]}» la vista debería decir «${quiere}» y dice «${String(r[k])}». Fíjate en el espacio después de los dos puntos.`);
        }
      }
      return ok("La firma aparece letra a letra. Wes llora un poquito.");
    },
    hints: [
      "Busca #firma y #vista. Escucha el evento \"input\" en #firma.",
      "Dentro de la función: vista.textContent = \"Firmado por: \" + firma.value;",
      'let firma = document.querySelector("#firma");\nlet vista = document.querySelector("#vista");\nfirma.addEventListener("input", () => {\n  vista.textContent = "Firmado por: " + firma.value;\n});',
    ],
    debrief: [
      { who: "wes", text: "Escribí mi nombre diecisiete veces. Sale distinto cada vez. Bueno, sale igual, pero lo veo nacer.", mood: "alegre" },
      { who: "lena", text: "Ya escucha clics y letras. Lo siguiente sería escuchar el teclado entero." },
      { who: "kraus", text: "¡Atajos! Me encantan los atajos. Ven." },
    ],
  },
  {
    id: "dd8",
    act: 2,
    title: "Atajos de teclado",
    concept: "keydown y e.key",
    sandbox: "dom",
    giver: "kraus",
    briefing: [
      { who: "kraus", text: "Quedan cuatro días. En la demo voy a estar de pie, con el teclado en una mano y el micrófono en la otra." },
      { who: "kraus", text: "Si pulso la h, sale el panel de ayuda; si la pulso otra vez, se va. Y Escape lo cierra siempre. Sin ratón.", mood: "serio" },
    ],
    lesson: {
      title: "El teclado: keydown",
      body: "El evento `\"keydown\"` salta al pulsar una tecla. Si lo escuchas en `document`, recibe todas las teclas de la página. La función puede recibir el evento, `e`: `e.key` dice qué tecla fue (\"a\", \"Enter\", \"Escape\"...). Con `if` y `else if` decides qué hacer según la tecla.",
      example: 'document.addEventListener("keydown", (e) => {\n  if (e.key === "Enter") {\n    console.log("Enter pulsado");\n  }\n});',
    },
    task: "Escucha \"keydown\" en `document`. Si `e.key` es \"h\", alterna la clase \"oculto\" de `#ayuda`. Si es \"Escape\", añádele la clase \"oculto\" (la cierra aunque ya esté cerrada). Con cualquier otra tecla no pasa nada.",
    starter: STARTER,
    borrowed: [],
    cases: [
      caso(
        "página de la demo",
        pagina(
          "Demo de Nébula",
          `<h1>Demo de Nébula</h1><p>Pulsa h para ver la ayuda.</p><div id="ayuda" class="oculto"><table><tr><td>h</td><td>muestra u oculta esta ayuda</td></tr><tr><td>Escape</td><td>cierra la ayuda</td></tr></table></div>${PIE("Ensayo general")}`,
        ),
      ),
      caso(
        "página de soporte",
        pagina(
          "Soporte Nébula",
          `<h1>Soporte técnico</h1>${OBRAS}<p>¿Perdido? Pulsa h.</p><div id="ayuda" class="oculto"><p>Llámenos al 555-0199 de 9 a 17 h, o escriba a soporte@nebula.com.</p></div>${PIE("Atención al cliente")}`,
        ),
      ),
    ],
    capture: [],
    probe:
      '(() => { const v = () => !document.querySelector("#ayuda").classList.contains("oculto"); const r = [v()]; for (const k of ["x", "h", "h", "h", "Escape", "Escape"]) { __key(k); r.push(v()); } return { r }; })()',
    check: (outs) => {
      const pasos = ["al cargar", "tras pulsar x", "tras pulsar h", "tras pulsar h otra vez", "tras pulsar h una tercera vez", "tras pulsar Escape", "tras pulsar Escape otra vez"];
      const quiere = [false, false, true, false, true, false, false];
      for (const o of outs) {
        const p = leer(o);
        if (typeof p === "string") return no(p);
        const r = (p.r as boolean[]) ?? [];
        for (let k = 0; k < quiere.length; k++) {
          if (r[k] === quiere[k]) continue;
          if (k === 0) return no("La ayuda se ve nada más cargar. Solo debe aparecer al pulsar h.");
          if (k === 1) return no("Pulsé la x y apareció la ayuda. Compara la tecla: if (e.key === \"h\").");
          if (k === 2) return no("Pulsé la h y la ayuda no apareció. Escucha \"keydown\" en document y alterna la clase oculto de #ayuda.");
          if (k === 3) return no("Pulsé la h otra vez y la ayuda no se fue. Con h, usa classList.toggle(\"oculto\").");
          if (k === 5 || k === 6) return no(`La ayuda sigue a la vista ${pasos[k]}. Con Escape, añade la clase: ayuda.classList.add("oculto").`);
          return no(`${pasos[k]} la ayuda debería ${quiere[k] ? "verse" : "estar oculta"}.`);
        }
      }
      return ok("La h abre, la h cierra y Escape siempre cierra. Kraus ya no necesita ratón.");
    },
    hints: [
      "document.addEventListener(\"keydown\", (e) => { ... }); y dentro mira e.key.",
      "if (e.key === \"h\") { ayuda.classList.toggle(\"oculto\"); } else if (e.key === \"Escape\") { ... }",
      'let ayuda = document.querySelector("#ayuda");\ndocument.addEventListener("keydown", (e) => {\n  if (e.key === "h") {\n    ayuda.classList.toggle("oculto");\n  } else if (e.key === "Escape") {\n    ayuda.classList.add("oculto");\n  }\n});',
    ],
    debrief: [
      { who: "kraus", text: "h, h, Escape. h, h, Escape. Podría hacer esto toda la tarde.", mood: "alegre" },
      { who: "wes", text: "Lo ha hecho toda la tarde." },
      { who: "lena", text: "La página ya reacciona. Ahora falta que construya cosas sola." },
    ],
  },

  // ===== Acto 3: La demo =====
  {
    id: "dd9",
    act: 3,
    title: "Novedades que crecen",
    concept: "createElement y appendChild",
    sandbox: "dom",
    giver: "kraus",
    briefing: [
      { who: "kraus", text: "Quedan tres días. Cada vez que hay una novedad, Wes reescribe la página entera. Así no llegamos." },
      { who: "kraus", text: "Quiero una función que añada una novedad a la lista. Le das un texto, aparece un punto nuevo. Y estrénala con las tres de hoy." },
    ],
    lesson: {
      title: "Crear elementos nuevos",
      body: "`document.createElement(\"li\")` fabrica un elemento nuevo, pero todavía flota fuera de la página. Le das texto con `textContent` y lo colocas con `padre.appendChild(nuevo)`, que lo añade al final dentro del padre. Así la página crece sin borrar lo que ya tenía.",
      example: 'let fila = document.createElement("p");\nfila.textContent = "Recién llegado";\ndocument.querySelector("#tablon").appendChild(fila);',
    },
    task: "Escribe la función `agregar(texto)` que cree un `<li>` con ese texto y lo añada al final de `#novedades`. Luego crea el array `nuevas` con \"Ahora con JavaScript\", \"Botones que responden\" y \"Nébula 1.0 beta\", y llama a `agregar` con cada una, en ese orden. Las novedades que ya hay deben quedarse.",
    starter: STARTER,
    borrowed: [],
    cases: NOVEDADES.map((items, i) =>
      caso(
        i === 0 ? "novedades de la portada" : "novedades de la intranet",
        pagina(
          "Novedades",
          `<h1>Qué hay de nuevo</h1><ul id="novedades">${items.map((t) => `<li>${t}</li>`).join("")}</ul>${OBRAS}${PIE(i === 0 ? "Portada" : "Intranet")}`,
        ),
      ),
    ),
    capture: [],
    probe:
      'typeof agregar !== "function" ? { sinFuncion: true } : (() => { const tras = [...document.querySelectorAll("#novedades li")].map((l) => l.textContent.trim()); agregar("Prueba de Kraus"); return { tras, ultimo: __text("#novedades li:last-child"), n: __count("#novedades li") }; })()',
    check: (outs) => {
      for (let i = 0; i < outs.length; i++) {
        const p = leer(outs[i]);
        if (typeof p === "string") return no(p);
        if (p.sinFuncion) return no("No encuentro la función agregar. Créala con function agregar(texto) { ... }.");
        const viejas = NOVEDADES[i];
        const quiere = [...viejas, ...NUEVAS];
        const tras = (p.tras as string[]) ?? [];
        if (viejas.some((v) => !tras.includes(v)))
          return no("Se borraron las novedades que ya estaban. appendChild añade al final sin tocar las demás.");
        if (tras.length === viejas.length)
          return no("La lista no tiene las novedades nuevas. Crea el array nuevas y llama a agregar con cada una (por ejemplo con forEach).");
        if (JSON.stringify(tras) !== JSON.stringify(quiere))
          return no(`La lista debería quedar así: ${quiere.join(" / ")}. Y quedó: ${tras.join(" / ")}.`);
        if (p.ultimo !== "Prueba de Kraus" || p.n !== quiere.length + 1)
          return no("Llamé a agregar(\"Prueba de Kraus\") y no apareció al final de #novedades. Usa el texto que recibe la función.");
      }
      return ok("Tres novedades nuevas, y la función sirve para las que vengan.");
    },
    hints: [
      "Dentro de la función: let li = document.createElement(\"li\"); li.textContent = texto;",
      "Para colocarlo: document.querySelector(\"#novedades\").appendChild(li); Después: nuevas.forEach((t) => agregar(t));",
      'function agregar(texto) {\n  let li = document.createElement("li");\n  li.textContent = texto;\n  document.querySelector("#novedades").appendChild(li);\n}\nlet nuevas = ["Ahora con JavaScript", "Botones que responden", "Nébula 1.0 beta"];\nnuevas.forEach((t) => agregar(t));',
    ],
    debrief: [
      { who: "kraus", text: "Una función y la lista crece sola. Wes, ya puedes dormir.", mood: "alegre" },
      { who: "wes", text: "No pienso dormir. Pero sí tengo una lista de pendientes que no para de crecer. Lena, ¿me ayudas a que encoja?" },
    ],
  },
  {
    id: "dd10",
    act: 3,
    title: "Tachar pendientes",
    concept: "delegación y remove",
    sandbox: "dom",
    giver: "wes",
    briefing: [
      { who: "wes", text: "Mi lista de pendientes para la demo. Quiero hacer clic en una tarea y que desaparezca. Es terapéutico." },
      { who: "wes", text: "Ojo: Kraus añade tareas nuevas cada hora. Las que lleguen después también tienen que poder borrarse.", mood: "serio" },
      { who: "lena", text: "Entonces no puedo poner un oyente en cada tarea. Las nuevas no lo tendrían." },
    ],
    lesson: {
      title: "Delegación: un oyente para toda la lista",
      body: "Los clics suben: si haces clic en un `<li>`, el evento llega también a su `<ul>`. Por eso basta con un solo `addEventListener` en la lista, y sirve hasta para los elementos que se añadan después. Dentro, `e.target` es el elemento exacto donde cayó el clic y `e.target.tagName` su etiqueta en mayúsculas (\"LI\"). `elemento.remove()` lo quita de la página.",
      example: 'document.querySelector("#menu").addEventListener("click", (e) => {\n  if (e.target.tagName === "LI") {\n    console.log(e.target.textContent); // el plato elegido\n  }\n});',
    },
    task: "Pon un solo `addEventListener(\"click\", ...)` en `#pendientes`. Si el clic cae en un `<li>` (`e.target.tagName === \"LI\"`), bórralo con `remove()` y haz que `#quedan` diga \"Quedan \" seguido de cuántos `<li>` quedan en la lista. Si cae en otro sitio de la lista, no pasa nada.",
    starter: STARTER,
    borrowed: [],
    cases: PENDIENTES.map((items, i) =>
      caso(
        i === 0 ? "pendientes de Wes" : "pendientes de Kraus",
        pagina(
          "Pendientes",
          `<h1>${i === 0 ? "Pendientes de Wes" : "Pendientes de Kraus"}</h1><p>Haz clic en una tarea para tacharla.</p><ul id="pendientes">${items.map((t) => `<li>${t}</li>`).join("")}</ul><p id="quedan">Quedan ${items.length}</p>${PIE("Antes de la demo")}`,
          "#pendientes li{cursor:pointer;padding:2px}",
        ),
      ),
    ),
    capture: [],
    probe:
      '(() => { const ul = document.querySelector("#pendientes"); const tarde = document.createElement("li"); tarde.textContent = "Tarea que llegó tarde"; ul.appendChild(tarde); const n0 = __count("#pendientes li"); __click("#pendientes li"); const n1 = __count("#pendientes li"); const q1 = __text("#quedan"); __click("#pendientes li:last-child"); const sigue = [...document.querySelectorAll("#pendientes li")].some((l) => l.textContent.includes("tarde")); const n2 = __count("#pendientes li"); const q2 = __text("#quedan"); __click("#pendientes"); return { n0, n1, q1, sigue, n2, q2, lista: __count("#pendientes"), n3: __count("#pendientes li") }; })()',
    check: (outs) => {
      for (const o of outs) {
        const p = leer(o);
        if (typeof p === "string") return no(p);
        const n0 = Number(p.n0);
        if (p.n1 === n0) return no("Hice clic en la primera tarea y no se borró. Escucha el clic en #pendientes y usa e.target.remove().");
        if (p.n1 !== n0 - 1) return no(`Tras un clic debería haber ${n0 - 1} tareas y hay ${String(p.n1)}. Borra solo la tarea donde cayó el clic.`);
        if (p.q1 !== `Quedan ${n0 - 1}`) return no(`Tras borrar una, #quedan debería decir «Quedan ${n0 - 1}» y dice «${String(p.q1)}». Cuenta los li que quedan después de borrar.`);
        if (p.sigue)
          return no("Añadí una tarea después de que corriera tu código, hice clic en ella y no se borró. Pon un solo oyente en #pendientes, no uno en cada li.");
        if (p.q2 !== `Quedan ${n0 - 2}`) return no(`Tras borrar dos, #quedan debería decir «Quedan ${n0 - 2}» y dice «${String(p.q2)}».`);
        if (p.lista === 0)
          return no("Hice clic en un hueco de la lista y se borró la lista entera. Comprueba que e.target.tagName sea \"LI\" antes de borrar.");
        if (p.n3 !== p.n2) return no("Un clic fuera de las tareas borró algo. Borra solo si e.target.tagName es \"LI\".");
      }
      return ok("Clic y fuera. Hasta las tareas que llegan tarde.");
    },
    hints: [
      "Un solo oyente: document.querySelector(\"#pendientes\").addEventListener(\"click\", (e) => { ... });",
      "Dentro: if (e.target.tagName === \"LI\") { e.target.remove(); ... } y cuenta con document.querySelectorAll(\"#pendientes li\").length.",
      'let lista = document.querySelector("#pendientes");\nlista.addEventListener("click", (e) => {\n  if (e.target.tagName === "LI") {\n    e.target.remove();\n    let quedan = document.querySelectorAll("#pendientes li").length;\n    document.querySelector("#quedan").textContent = "Quedan " + quedan;\n  }\n});',
    ],
    debrief: [
      { who: "wes", text: "Clic. Clic. Clic. Ya no tengo pendientes. Me siento una persona nueva.", mood: "alegre" },
      { who: "kraus", text: "Tienes uno: el formulario de la beta. Quedan dos días y la gente se apunta con el correo vacío.", mood: "serio" },
    ],
  },
  {
    id: "dd11",
    act: 3,
    title: "Apúntate a la beta",
    concept: "submit y preventDefault",
    sandbox: "dom",
    giver: "kraus",
    briefing: [
      { who: "kraus", text: "Quedan dos días. El formulario de la beta manda lo que sea al servidor, aunque esté vacío. Y la página se recarga." },
      { who: "kraus", text: "Que el guion lo revise antes: si falta el correo, que lo diga ahí mismo. Si está, que dé las gracias. Sin recargar nada." },
    ],
    lesson: {
      title: "Formularios: submit y preventDefault",
      body: "Al enviar un `<form>` salta el evento `\"submit\"`, y después el navegador recarga la página. `e.preventDefault()` cancela esa recarga para que el guion decida qué hacer. `texto.trim()` quita los espacios de los bordes: así un campo con solo espacios cuenta como vacío.",
      example: 'document.querySelector("#busca").addEventListener("submit", (e) => {\n  e.preventDefault();\n  console.log("  hola  ".trim()); // hola\n});',
    },
    task: "Escucha \"submit\" en `#registro` y llama a `e.preventDefault()`. Lee el valor de `#correo` sin espacios en los bordes (`.trim()`). Si está vacío, `#error` dice \"Falta el correo\". Si no, `#error` queda vacío (\"\") y `#gracias` dice \"Apuntado: \" seguido del correo.",
    starter: STARTER,
    borrowed: [],
    cases: CORREOS.map((c, i) =>
      caso(
        i === 0 ? "formulario vacío" : "formulario que ya trae un correo",
        pagina(
          "Beta de Nébula",
          `<h1>Apúntate a la beta</h1><p>Sé de los primeros en probar páginas que reaccionan.</p><form id="registro"><table><tr><td>Correo:</td><td><input id="correo"${c ? ` value="${c}"` : ""} size="28"></td></tr></table><p><button>Quiero la beta</button></p></form><p id="error"></p><p id="gracias"></p>${OBRAS}${PIE("Sin spam, palabra de Kraus")}`,
          "#error{color:#c00;font-weight:bold}#gracias{color:#060}",
        ),
      ),
    ),
    capture: [],
    probe:
      '(() => { const p1 = __submit("#registro"); const e1 = __text("#error"); const g1 = __text("#gracias"); __type("#correo", "   "); const p2 = __submit("#registro"); const e2 = __text("#error"); __type("#correo", "ana@red.net"); const p3 = __submit("#registro"); return { p1, e1, g1, p2, e2, p3, e3: __text("#error"), g3: __text("#gracias") }; })()',
    check: (outs) => {
      for (let i = 0; i < outs.length; i++) {
        const p = leer(outs[i]);
        if (typeof p === "string") return no(p);
        const inicial = CORREOS[i];
        if (!p.p1 || !p.p2 || !p.p3)
          return no("Al enviar el formulario la página se recargaría. Llama a e.preventDefault() al principio de la función del submit.");
        if (inicial === "") {
          if (p.e1 !== "Falta el correo")
            return no(`Envié el formulario vacío y #error dice «${String(p.e1)}». Debería decir «Falta el correo».`);
        } else if (p.g1 !== `Apuntado: ${inicial}`) {
          if (p.e1 === "Falta el correo")
            return no(`Este formulario ya traía «${inicial}» y dijiste que faltaba. Lee el valor de #correo dentro de la función del submit, no antes.`);
          return no(`El formulario traía «${inicial}» y #gracias dice «${String(p.g1)}». Debería decir «Apuntado: ${inicial}».`);
        }
        if (p.e2 !== "Falta el correo")
          return no("Envié un correo hecho solo de espacios y no saltó el error. Usa .trim() antes de comprobar si está vacío.");
        if (p.g3 !== "Apuntado: ana@red.net")
          return no(`Envié «ana@red.net» y #gracias dice «${String(p.g3)}». Debería decir «Apuntado: ana@red.net».`);
        if (p.e3 !== "") return no("Con un correo válido, el error anterior se quedó a la vista. Vacía #error con textContent = \"\".");
      }
      return ok("El formulario avisa, agradece y no recarga nada.");
    },
    hints: [
      "form.addEventListener(\"submit\", (e) => { e.preventDefault(); ... }); y dentro lee document.querySelector(\"#correo\").value.trim().",
      "if (correo === \"\") { error dice \"Falta el correo\" } else { error vacío y gracias con \"Apuntado: \" + correo }",
      'let form = document.querySelector("#registro");\nform.addEventListener("submit", (e) => {\n  e.preventDefault();\n  let correo = document.querySelector("#correo").value.trim();\n  if (correo === "") {\n    document.querySelector("#error").textContent = "Falta el correo";\n  } else {\n    document.querySelector("#error").textContent = "";\n    document.querySelector("#gracias").textContent = "Apuntado: " + correo;\n  }\n});',
    ],
    debrief: [
      { who: "kraus", text: "Trescientos apuntados en una hora. Ninguno vacío. ¡Ninguno!", mood: "sorpresa" },
      { who: "kraus", text: "Mañana es el día. Lena, quiero la demo que junte todo. La que haga que se les caiga la mandíbula.", mood: "serio" },
    ],
  },
  {
    id: "dd12",
    act: 3,
    title: "La demo",
    concept: "Todo junto: filtrar una lista",
    sandbox: "dom",
    giver: "kraus",
    briefing: [
      { who: "kraus", text: "Día diez. Quedan horas. Delante de la prensa: una lista de novedades y un buscador encima." },
      { who: "kraus", text: "Escribo una palabra y la lista se encoge sola mientras escribo. Sin recargar. Sin botón. Eso es el futuro." },
      { who: "wes", text: "Y que diga cuántas se ven. A la prensa le encantan los números." },
      { who: "lena", text: "Seleccionar, escuchar, cambiar. Ya sé hacer las tres cosas.", mood: "alegre" },
    ],
    lesson: {
      title: "Filtrar mientras se escribe",
      body: "Junta lo aprendido: escucha \"input\" en el buscador y recorre los `<li>` con `forEach`. `texto.toLowerCase()` pasa un texto a minúsculas y `texto.includes(otro)` dice si contiene al otro: compara los dos en minúsculas para que dé igual cómo escriban. `style.display = \"none\"` oculta un elemento y `style.display = \"\"` lo vuelve a mostrar.",
      example: 'let frase = "Nébula Navegador";\nconsole.log(frase.toLowerCase().includes("nave")); // true\ndocument.querySelector("#viejo").style.display = "none";',
    },
    task: "Cuando cambie el texto de `#buscar` (evento \"input\"), recorre los `<li>` de `#lista`: los que contienen lo escrito (en minúsculas los dos) se muestran con `style.display = \"\"` y los demás se ocultan con `style.display = \"none\"`. Además, `#resultados` dice \"Mostrando X de Y\", con X los que se ven e Y el total.",
    starter: STARTER,
    borrowed: [],
    cases: DEMO.map((items, i) =>
      caso(
        i === 0 ? "demo para la prensa" : "demo para los inversores",
        pagina(
          "Nébula 1.0 beta",
          `<h1>Nébula 1.0 beta</h1><p><b>Buscar novedades:</b> <input id="buscar" size="30"></p><ul id="lista">${items.map((t) => `<li>${t}</li>`).join("")}</ul><p id="resultados">Mostrando ${items.length} de ${items.length}</p>${OBRAS}${PIE("Nébula Communications, Mountain View")}`,
          "#resultados{font-style:italic}",
        ),
      ),
    ),
    capture: [],
    probe:
      '["javascript", "", "NAVEGADOR", "zzz", ""].map((q) => (__type("#buscar", q), { q, vis: [...document.querySelectorAll("#lista li")].filter((li) => li.style.display !== "none").map((li) => li.textContent.trim()), res: __text("#resultados"), n: __count("#lista li") }))',
    check: (outs) => {
      for (let i = 0; i < outs.length; i++) {
        const o = outs[i];
        const items = DEMO[i];
        if (!o.ok) return no(`Tu código dio un error: ${o.error?.message ?? "desconocido"}.`);
        const raw = o.values.__probe as unknown;
        if (raw && typeof raw === "object" && "__err" in (raw as P)) return no(`Al probar la página pasó esto: ${String((raw as P).__err)}.`);
        const r = (raw as { q: string; vis: string[]; res: string; n: number }[]) ?? [];
        for (const paso of r) {
          if (paso.n !== items.length) return no("La lista perdió elementos. Ocúltalos con style.display = \"none\", no los borres.");
          const quiere = items.filter((t) => t.toLowerCase().includes(paso.q.toLowerCase()));
          const mismo = JSON.stringify(paso.vis) === JSON.stringify(quiere);
          if (!mismo) {
            if (paso.q === "")
              return no("Al borrar la búsqueda deben volver a verse todas las novedades. Muestra las que coinciden con style.display = \"\".");
            if (paso.vis.length === items.length)
              return no(`Escribí «${paso.q}» y se siguen viendo todas. Escucha "input" en #buscar y oculta las que no coinciden.`);
            if (paso.q === "javascript" && paso.vis.length === 0)
              return no("Escribí «javascript» y no salió ninguna, aunque hay novedades con «JavaScript». Pasa a minúsculas el texto de cada li antes de comparar.");
            if (paso.q === "NAVEGADOR" && paso.vis.length === 0)
              return no("Escribí «NAVEGADOR» en mayúsculas y no salió ninguna. Pasa también lo escrito a minúsculas con toLowerCase().");
            return no(`Al buscar «${paso.q}» deberían verse ${quiere.length} y se ven ${paso.vis.length}: ${paso.vis.join(" / ") || "ninguna"}.`);
          }
          const res = `Mostrando ${quiere.length} de ${items.length}`;
          if (paso.res !== res)
            return no(`Al buscar «${paso.q}», #resultados debería decir «${res}» y dice «${String(paso.res)}».`);
        }
      }
      return ok("La lista se encoge mientras escribes. La sala entera se queda callada.");
    },
    hints: [
      "Guarda los li con querySelectorAll(\"#lista li\") y, dentro del evento input, recórrelos con forEach. Lleva la cuenta de los visibles en una variable.",
      "Para cada li: if (li.textContent.toLowerCase().includes(texto)) { li.style.display = \"\"; visibles++; } else { li.style.display = \"none\"; }",
      'let buscar = document.querySelector("#buscar");\nlet items = document.querySelectorAll("#lista li");\nbuscar.addEventListener("input", () => {\n  let texto = buscar.value.toLowerCase();\n  let visibles = 0;\n  items.forEach((li) => {\n    if (li.textContent.toLowerCase().includes(texto)) {\n      li.style.display = "";\n      visibles++;\n    } else {\n      li.style.display = "none";\n    }\n  });\n  document.querySelector("#resultados").textContent = "Mostrando " + visibles + " de " + items.length;\n});',
    ],
    debrief: [
      { who: "kraus", text: "Ni un fallo. Ni uno. En diez años nadie se va a acordar de cómo era la web antes de hoy.", mood: "sorpresa" },
      { who: "wes", text: "Yo sí. Era gris. Ahora es gris, pero se mueve.", mood: "alegre" },
    ],
  },
];

export const CONTENT: StoryContent = {
  intro: [
    { who: "narrador", text: "Mountain View, California. Mayo de 1995." },
    { who: "narrador", text: "En Nébula Communications hacen el navegador Nébula, la ventana por la que medio mundo empieza a asomarse a la web." },
    { who: "narrador", text: "Pero las páginas son papel quieto: texto, fotos y enlaces. Nada se mueve. Nada responde." },
    { who: "kraus", text: "¡Lena! Bienvenida. Te contraté un lunes y te pido un milagro el mismo lunes. Así trabajamos aquí.", mood: "alegre" },
    { who: "kraus", text: "Tenemos un lenguaje nuevo de guiones. En diez días enseñamos la beta: páginas que reaccionan. Tú lo pruebas en páginas de verdad." },
    { who: "lena", text: "¿Diez días? ¿Para cambiar cómo funcionan las páginas?", mood: "sorpresa" },
    { who: "kraus", text: "Nueve y medio, si seguimos hablando." },
  ],
  acts: [
    {
      n: 1,
      title: "Tocar la página",
      date: "Mayo de 1995, días 1 a 3",
      opening: [
        { who: "narrador", text: "Una oficina con moqueta, cajas de pizza y monitores de catorce pulgadas." },
        { who: "narrador", text: "Antes de que una página reaccione, el guion tiene que aprender a encontrar sus piezas y cambiarlas." },
      ],
    },
    {
      n: 2,
      title: "Que reaccione",
      date: "Mayo de 1995, días 4 a 7",
      opening: [
        { who: "narrador", text: "El guion ya cambia la página. Pero lo hace una vez, al cargar, y se queda quieto." },
        { who: "narrador", text: "Kraus lo dice en cada reunión: una página que no escucha es un folleto." },
        { who: "kraus", text: "Quedan siete días. Quiero que la página espere a la gente y le conteste.", mood: "serio" },
      ],
    },
    {
      n: 3,
      title: "La demo",
      date: "Mayo de 1995, días 8 a 10",
      opening: [
        { who: "narrador", text: "Tres días. La prensa ya tiene la invitación. Wes ha dejado de ir a su casa." },
        { who: "narrador", text: "Falta lo más difícil: que la página construya, borre y revise cosas por su cuenta." },
      ],
    },
  ],
  missions,
  ending: [
    { who: "narrador", text: "Día diez, por la tarde. La sala huele a café frío. Hay periodistas de pie al fondo." },
    { who: "narrador", text: "Lena escribe «java» en el buscador. La lista se encoge sola. Alguien aplaude primero; luego todos." },
    { who: "wes", text: "Mi contador marca 1995 visitas. Casi todas son mías, pero cuentan.", mood: "alegre" },
    { who: "narrador", text: "Esa noche suben la beta. A las 3:12 de la madrugada, alguien en otra ciudad hace clic en un botón. La página le contesta." },
    { who: "lena", text: "Hace diez días no sabía qué era el DOM. Hoy sé encontrar, cambiar, escuchar y construir.", mood: "alegre" },
    { who: "lena", text: "Y ahora cualquiera, en cualquier parte, puede escribir un guion y hacer que su página responda.", mood: "sorpresa" },
    { who: "kraus", text: "Quedan cero días, Lena. Mi número favorito.", mood: "alegre" },
    { who: "narrador", text: "Diez días después de empezar, la web dejó de ser papel." },
  ],
};
