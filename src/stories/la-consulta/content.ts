// La consulta — San José, California, 1974. En el laboratorio de la Compañía
// Continental de Máquinas Contables, el Dr. Fenton propone guardar los datos en
// tablas y preguntar en un lenguaje casi inglés. Nora aprende SQL desde cero
// respondiendo las preguntas de Aerolíneas Pacífico. Personas y empresas ficticias.
import type { StoryContent, StoryMission } from "../types";
import type { TestCase } from "../../game/types";
import { sqlCheck } from "../../game/sandbox-sql";

// ------------------------------------------------------------------ datos

type Row = (string | number)[];
const lit = (v: string | number) => (typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`);
const table = (name: string, cols: string, rows: Row[]) =>
  `CREATE TABLE ${name} (${cols}); INSERT INTO ${name} VALUES ${rows.map((r) => `(${r.map(lit).join(", ")})`).join(", ")};`;

// Actos 1 y 2: la cinta de vuelos de cada día.
const VUELOS_COLS = "id INTEGER, numero TEXT, origen TEXT, destino TEXT, hora TEXT, plazas_libres INTEGER, precio INTEGER";

const VUELOS_LUNES: Row[] = [
  [1, "PA101", "San Francisco", "Denver", "07:15", 7, 89],
  [2, "PA102", "San Francisco", "Reno", "08:00", 0, 49],
  [3, "PA103", "San Diego", "Denver", "09:30", 25, 95],
  [4, "PA104", "San Francisco", "Honolulu", "10:45", 3, 210],
  [5, "PA105", "Seattle", "Reno", "11:20", 18, 65],
  [6, "PA106", "San Francisco", "Phoenix", "13:00", 0, 79],
  [7, "PA107", "San Diego", "Portland", "14:10", 9, 99],
  [8, "PA108", "Seattle", "Denver", "15:40", 31, 120],
  [9, "PA109", "San Francisco", "Reno", "17:05", 14, 55],
  [10, "PA110", "San Diego", "Honolulu", "18:30", 6, 185],
];

const VUELOS_MARTES: Row[] = [
  [1, "PA201", "San Francisco", "Reno", "07:00", 22, 52],
  [2, "PA202", "Seattle", "Denver", "08:20", 0, 115],
  [3, "PA203", "San Francisco", "Denver", "09:15", 8, 92],
  [4, "PA204", "San Diego", "Boise", "10:00", 17, 74],
  [5, "PA205", "San Francisco", "Portland", "12:30", 0, 88],
  [6, "PA206", "San Diego", "Reno", "13:45", 11, 60],
  [7, "PA207", "Seattle", "Honolulu", "15:00", 4, 230],
  [8, "PA208", "San Francisco", "Denver", "16:20", 27, 85],
  [9, "PA209", "San Diego", "Denver", "19:10", 2, 99],
];

const CINTA: TestCase[] = [
  { label: "cinta del lunes", globals: () => ({ __setup: table("vuelos", VUELOS_COLS, VUELOS_LUNES) }) },
  { label: "cinta del martes", globals: () => ({ __setup: table("vuelos", VUELOS_COLS, VUELOS_MARTES) }) },
];
const VUELOS_FORMA = "vuelos (id, numero, origen, destino, hora, plazas_libres, precio)";

// Acto 3: tres tablas que se relacionan por su id.
interface Semana {
  vuelos: Row[];
  pasajeros: Row[];
  reservas: Row[];
}

const SEMANA_1: Semana = {
  vuelos: [
    [1, "PA301", "Denver", 90],
    [2, "PA302", "Reno", 50],
    [3, "PA303", "Honolulu", 200],
    [4, "PA304", "Phoenix", 80],
  ],
  pasajeros: [
    [1, "Ana Ruiz", "555-0101"],
    [2, "Bill Tanner", "555-0102"],
    [3, "Carmen Vega", "555-0103"],
    [4, "Dave Olsen", "555-0104"],
    [5, "Elena Park", "555-0105"],
    [6, "Frank Doyle", "555-0106"],
    [7, "Grace Imura", "555-0107"],
  ],
  reservas: [
    [1, 1, 1, "4A"],
    [2, 2, 2, "2C"],
    [3, 3, 3, "7B"],
    [4, 1, 3, "7C"],
    [5, 5, 2, "3A"],
    [6, 6, 2, "3B"],
    [7, 2, 4, "1A"],
    [8, 5, 1, "9D"],
  ],
};

const SEMANA_2: Semana = {
  vuelos: [
    [1, "PA401", "Denver", 95],
    [2, "PA402", "Reno", 55],
    [3, "PA403", "Honolulu", 210],
    [4, "PA404", "Portland", 85],
    [5, "PA405", "Phoenix", 75],
  ],
  pasajeros: [
    [1, "Hugo Diaz", "555-0201"],
    [2, "Irene Shaw", "555-0202"],
    [3, "Jack Pruitt", "555-0203"],
    [4, "Karen Wolfe", "555-0204"],
    [5, "Luis Mora", "555-0205"],
    [6, "Mary Quinn", "555-0206"],
  ],
  reservas: [
    [1, 1, 2, "5A"],
    [2, 2, 1, "2B"],
    [3, 3, 2, "5B"],
    [4, 4, 4, "8C"],
    [5, 1, 4, "8D"],
    [6, 2, 2, "6A"],
    [7, 3, 1, "3C"],
    [8, 4, 2, "6B"],
    [9, 2, 4, "9A"],
  ],
};

/** Las tres tablas de una semana. Con `rebaja`, los vuelos a Reno ya bajaron 10 dólares. */
const semana = (s: Semana, rebaja = false) =>
  table(
    "vuelos",
    "id INTEGER, numero TEXT, destino TEXT, precio INTEGER",
    s.vuelos.map((v) => (rebaja && v[2] === "Reno" ? [v[0], v[1], v[2], (v[3] as number) - 10] : v)),
  ) +
  table("pasajeros", "id INTEGER, nombre TEXT, telefono TEXT", s.pasajeros) +
  table("reservas", "id INTEGER, pasajero_id INTEGER, vuelo_id INTEGER, asiento TEXT", s.reservas);

const ARCHIVO = (rebaja = false): TestCase[] => [
  { label: "primera semana de mayo", globals: () => ({ __setup: semana(SEMANA_1, rebaja) }) },
  { label: "segunda semana de mayo", globals: () => ({ __setup: semana(SEMANA_2, rebaja) }) },
];
const TABLAS_ACTO3 = [
  "vuelos (id, numero, destino, precio)",
  "pasajeros (id, nombre, telefono)",
  "reservas (id, pasajero_id, vuelo_id, asiento)",
];

const STARTER = "-- Escribe tu consulta debajo\n";

/** Lo común a todas las misiones: SQL real, sin variables que capturar. */
const sqlMission = (m: Omit<StoryMission, "sandbox" | "starter" | "capture">): StoryMission => ({
  sandbox: "sql",
  starter: STARTER,
  capture: [],
  ...m,
});

// ------------------------------------------------------------------ misiones

const MISSIONS: StoryMission[] = [
  // ---------------------------------------------------------------- Acto 1
  sqlMission({
    id: "lc1",
    act: 1,
    giver: "fenton",
    title: "Una tabla",
    concept: "SELECT ... FROM",
    briefing: [
      { who: "fenton", text: "Mira esto. Pat me dejó pasar la cinta de vuelos de Aerolíneas Pacífico a una tabla. Se llama vuelos.", mood: "alegre" },
      { who: "fenton", text: "Una tabla es como una hoja cuadriculada: cada fila es un vuelo y cada columna, un dato del vuelo." },
      { who: "nora", text: "¿Y cómo le pido algo? ¿Hay que escribir un programa de mil líneas?" },
      { who: "fenton", text: "Una línea. Pídele el número y el destino de cada vuelo. Nada más.", mood: "alegre" },
    ],
    lesson: {
      title: "Preguntar a una tabla",
      body: "Una tabla guarda datos en filas y columnas, y tiene un nombre. Para pedirle datos se escribe `SELECT`, las columnas que quieres separadas por comas, `FROM` y el nombre de la tabla. El resultado es otra tabla, con las columnas en el orden en que las pediste. El punto y coma del final es opcional.",
      example: "SELECT titulo, autor FROM libros;",
    },
    task: "La tabla `vuelos` ya está cargada. Pide las columnas `numero` y `destino`, en ese orden, de todos los vuelos.",
    borrowed: [VUELOS_FORMA],
    cases: CINTA,
    sql: { solution: "SELECT numero, destino FROM vuelos", ordered: false },
    check: sqlCheck({ ordered: false, ok: "Todos los vuelos en un segundo. Sin tarjetas." }),
    hints: [
      "Empieza con SELECT, sigue con las dos columnas separadas por una coma y termina con FROM vuelos.",
      "SELECT numero, destino FROM ...",
      "SELECT numero, destino FROM vuelos;",
    ],
    debrief: [
      { who: "nora", text: "¿Ya está? ¿Eso es todo?", mood: "sorpresa" },
      { who: "fenton", text: "Eso es todo. Le dijiste qué querías, no cómo buscarlo. La máquina se encarga del cómo.", mood: "alegre" },
    ],
  }),

  sqlMission({
    id: "lc2",
    act: 1,
    giver: "pat",
    title: "Solo los de Denver",
    concept: "SELECT * y WHERE",
    briefing: [
      { who: "pat", text: "Llamó Aerolíneas Pacífico. Hay nieve en Denver y quieren la ficha completa de cada vuelo que va para allá." },
      { who: "pat", text: "Programación dice que tres semanas. Yo tardaría una tarde con las tarjetas. A ver qué tarda tu tabla.", mood: "serio" },
      { who: "nora", text: "Si las tarjetas se ordenan a mano, esto se ordena con palabras. Supongo." },
    ],
    lesson: {
      title: "Todas las columnas y solo algunas filas",
      body: "Con `SELECT *` pides todas las columnas sin escribirlas una a una. Para quedarte solo con algunas filas se añade `WHERE` y una condición después del `FROM`. Los textos van entre comillas simples (`'Boston'`) y los números sin comillas. Se compara con `=`, `>`, `<`, `>=`, `<=` y `<>` (distinto).",
      example: "SELECT * FROM empleados WHERE ciudad = 'Boston';\nSELECT * FROM empleados WHERE sueldo > 900;",
    },
    task: "De la tabla `vuelos`, pide todas las columnas (`*`) de los vuelos cuyo `destino` es `'Denver'`.",
    borrowed: [VUELOS_FORMA],
    cases: CINTA,
    sql: { solution: "SELECT * FROM vuelos WHERE destino = 'Denver'", ordered: false },
    check: sqlCheck({ ordered: false, ok: "Los vuelos a Denver, con todos sus datos. Pat ya los tiene." }),
    hints: [
      "Primero SELECT * FROM vuelos, y después WHERE con la condición sobre la columna destino.",
      "La ciudad es un texto: va entre comillas simples, 'Denver'.",
      "SELECT * FROM vuelos WHERE destino = 'Denver';",
    ],
    debrief: [
      { who: "pat", text: "Hmm. Cuatro minutos, contando lo que tardaste en encontrar la comilla.", mood: "serio" },
      { who: "pat", text: "No digo que me guste. Digo que lo apunto." },
    ],
  }),

  sqlMission({
    id: "lc3",
    act: 1,
    giver: "pat",
    title: "Treinta vendedores",
    concept: "AND / OR",
    briefing: [
      { who: "pat", text: "Una empresa de aspiradoras manda a sus vendedores a una convención. Les da igual Reno o Denver." },
      { who: "pat", text: "Pero viajan en grupos de diez. Necesitan vuelos a una de las dos ciudades con al menos 10 plazas libres." },
      { who: "fenton", text: "¡Dos condiciones! Una pregunta con dos condiciones. Las tarjetas se mueren de envidia.", mood: "alegre" },
    ],
    lesson: {
      title: "Varias condiciones a la vez",
      body: "En el `WHERE` se pueden juntar condiciones: con `AND` tienen que cumplirse las dos, con `OR` basta con una. Si mezclas los dos, usa paréntesis para decir qué va junto, igual que en matemáticas. Sin paréntesis, `AND` se agrupa primero y la pregunta cambia.",
      example: "SELECT nombre FROM empleados WHERE ciudad = 'Boston' AND sueldo > 900;\nSELECT titulo FROM libros WHERE (genero = 'novela' OR genero = 'poesia') AND paginas < 200;",
    },
    task: "De la tabla `vuelos`, pide `numero`, `destino` y `plazas_libres` (en ese orden) de los vuelos que tienen 10 o más `plazas_libres` y cuyo `destino` es `'Reno'` o `'Denver'`.",
    borrowed: [VUELOS_FORMA],
    cases: CINTA,
    sql: {
      solution: "SELECT numero, destino, plazas_libres FROM vuelos WHERE plazas_libres >= 10 AND (destino = 'Reno' OR destino = 'Denver')",
      ordered: false,
    },
    check: sqlCheck({ ordered: false, ok: "Vuelos con sitio para un grupo entero. Los vendedores llegarán a tiempo." }),
    hints: [
      "Necesitas dos ideas: plazas_libres >= 10, y destino Reno o destino Denver.",
      "El OR va entre paréntesis para que el AND afecte a las dos ciudades: (destino = 'Reno' OR destino = 'Denver').",
      "SELECT numero, destino, plazas_libres FROM vuelos WHERE plazas_libres >= 10 AND (destino = 'Reno' OR destino = 'Denver');",
    ],
    debrief: [
      { who: "nora", text: "Sin paréntesis me salían vuelos a Denver casi llenos. Los paréntesis cambian la pregunta." },
      { who: "pat", text: "Como las cartas a mi suegra. Un paréntesis mal puesto y ya no viene a cenar, viene a quedarse.", mood: "alegre" },
    ],
  }),

  sqlMission({
    id: "lc4",
    act: 1,
    giver: "pat",
    title: "Las tres ofertas",
    concept: "ORDER BY y LIMIT",
    briefing: [
      { who: "pat", text: "La aerolínea pone mañana un anuncio en el periódico. Quiere las tres ofertas más baratas, de menor a mayor." },
      { who: "pat", text: "Yo las buscaría pasando las diez tarjetas por la clasificadora. Dos veces, porque siempre se atasca." },
      { who: "fenton", text: "La tabla no se atasca. Bueno, casi nunca.", mood: "alegre" },
    ],
    lesson: {
      title: "Ordenar y quedarse con los primeros",
      body: "`ORDER BY columna` ordena el resultado: `ASC` de menor a mayor (es lo que hace si no dices nada) y `DESC` de mayor a menor. `LIMIT 3` se queda solo con las tres primeras filas. Van al final de la consulta, en ese orden: primero `ORDER BY` y luego `LIMIT`.",
      example: "SELECT titulo, paginas FROM libros ORDER BY paginas DESC LIMIT 2;",
    },
    task: "De la tabla `vuelos`, pide `numero`, `destino` y `precio` (en ese orden) de los tres vuelos más baratos, ordenados de menor a mayor `precio`.",
    borrowed: [VUELOS_FORMA],
    cases: CINTA,
    sql: { solution: "SELECT numero, destino, precio FROM vuelos ORDER BY precio ASC LIMIT 3", ordered: true },
    check: sqlCheck({ ordered: true, ok: "Las tres ofertas, listas para el periódico." }),
    hints: [
      "Ordena por precio de menor a mayor y quédate con tres filas.",
      "Al final de la consulta: ORDER BY precio ASC LIMIT 3",
      "SELECT numero, destino, precio FROM vuelos ORDER BY precio ASC LIMIT 3;",
    ],
    debrief: [
      { who: "pat", text: "Se lo leí por teléfono a la aerolínea. Me preguntaron qué programador lo había hecho." },
      { who: "pat", text: "Les dije que una chica con una terminal y un señor que habla con las tablas.", mood: "alegre" },
      { who: "fenton", text: "Con las relaciones, Pat. Hablo con las relaciones." },
    ],
  }),

  // ---------------------------------------------------------------- Acto 2
  sqlMission({
    id: "lc5",
    act: 2,
    giver: "pat",
    title: "El mapa del folleto",
    concept: "DISTINCT",
    briefing: [
      { who: "pat", text: "El folleto nuevo lleva un mapa con una estrella en cada ciudad a la que vuela Aerolíneas Pacífico." },
      { who: "pat", text: "Si pido los destinos me salen repetidos: Denver, Denver, Denver. El dibujante cobra por estrella.", mood: "serio" },
      { who: "nora", text: "Necesito cada ciudad una sola vez." },
    ],
    lesson: {
      title: "Cada valor una sola vez",
      body: "Si pones `DISTINCT` justo después de `SELECT`, las filas repetidas desaparecen y cada combinación sale una sola vez. Si pides una sola columna, obtienes la lista de sus valores distintos.",
      example: "SELECT DISTINCT ciudad FROM empleados;",
    },
    task: "De la tabla `vuelos`, pide la columna `destino`, cada ciudad una sola vez.",
    borrowed: [VUELOS_FORMA],
    cases: CINTA,
    sql: { solution: "SELECT DISTINCT destino FROM vuelos", ordered: false },
    check: sqlCheck({ ordered: false, ok: "Una estrella por ciudad. El dibujante no se hará rico." }),
    hints: [
      "Es SELECT destino FROM vuelos con una palabra más.",
      "La palabra va justo después de SELECT: SELECT DISTINCT ...",
      "SELECT DISTINCT destino FROM vuelos;",
    ],
    debrief: [
      { who: "pat", text: "Bien. Ahora la aerolínea ya no quiere listas. Quiere números." },
      { who: "fenton", text: "¡Números! Resumir una tabla entera en una fila. Eso sí que es bonito.", mood: "alegre" },
    ],
  }),

  sqlMission({
    id: "lc6",
    act: 2,
    giver: "fenton",
    title: "El resumen del día",
    concept: "COUNT, SUM, AVG y AS",
    briefing: [
      { who: "fenton", text: "El director de la aerolínea pide cada mañana tres números: cuántos vuelos hay, cuántas plazas quedan y el precio medio." },
      { who: "fenton", text: "Hoy se los calcula un contable con una sumadora. Tarda hasta las once." },
      { who: "pat", text: "Y se equivoca los lunes. Los lunes siempre.", mood: "serio" },
    ],
    lesson: {
      title: "Resumir muchas filas en una",
      body: "Hay funciones que resumen una columna entera: `COUNT(*)` cuenta las filas, `SUM(columna)` las suma y `AVG(columna)` saca la media. Con `AS` le das nombre a la columna del resultado: `COUNT(*) AS total`. Si no, se llamaría `COUNT(*)`.",
      example: "SELECT COUNT(*) AS empleados, SUM(sueldo) AS nomina, AVG(sueldo) AS sueldo_medio FROM empleados;",
    },
    task: "De la tabla `vuelos`, saca una fila con tres columnas, en este orden: el número de vuelos `AS vuelos`, la suma de `plazas_libres` `AS plazas` y la media de `precio` `AS precio_medio`.",
    borrowed: [VUELOS_FORMA],
    cases: CINTA,
    sql: {
      solution: "SELECT COUNT(*) AS vuelos, SUM(plazas_libres) AS plazas, AVG(precio) AS precio_medio FROM vuelos",
      ordered: false,
    },
    check: sqlCheck({ ordered: false, ok: "Tres números antes de las nueve. El contable puede desayunar tranquilo." }),
    hints: [
      "Las tres funciones van en el SELECT, separadas por comas: COUNT(*), SUM(plazas_libres) y AVG(precio).",
      "A cada una ponle su nombre con AS: COUNT(*) AS vuelos, ...",
      "SELECT COUNT(*) AS vuelos, SUM(plazas_libres) AS plazas, AVG(precio) AS precio_medio FROM vuelos;",
    ],
    debrief: [
      { who: "nora", text: "Diez filas entran, una sale. Es como exprimir una naranja." },
      { who: "fenton", text: "¡Exacto! Aunque yo lo habría dicho con más fórmulas.", mood: "alegre" },
    ],
  }),

  sqlMission({
    id: "lc7",
    act: 2,
    giver: "pat",
    title: "Desde 49 dólares",
    concept: "GROUP BY",
    briefing: [
      { who: "pat", text: "El folleto pone junto a cada ciudad cuántos vuelos hay y el precio más barato: \"Reno, desde 49 dólares\"." },
      { who: "pat", text: "Un resumen, pero uno por ciudad. ¿Eso tu tabla lo sabe hacer?" },
      { who: "fenton", text: "Se llama agrupar. Haces montoncitos y resumes cada montón.", mood: "alegre" },
    ],
    lesson: {
      title: "Un resumen por grupo",
      body: "`GROUP BY columna` reparte las filas en grupos, uno por cada valor de esa columna, y las funciones de resumen se calculan dentro de cada grupo. Además de `COUNT`, `SUM` y `AVG` están `MIN(columna)` (el menor) y `MAX(columna)` (el mayor). La columna del grupo se pone también en el `SELECT` para saber qué grupo es cada fila.",
      example: "SELECT ciudad, COUNT(*) AS empleados, MAX(sueldo) AS mejor_sueldo FROM empleados GROUP BY ciudad;",
    },
    task: "De la tabla `vuelos`, saca una fila por `destino` con tres columnas, en este orden: `destino`, el número de vuelos `AS vuelos` y el `precio` más bajo `AS desde`.",
    borrowed: [VUELOS_FORMA],
    cases: CINTA,
    sql: { solution: "SELECT destino, COUNT(*) AS vuelos, MIN(precio) AS desde FROM vuelos GROUP BY destino", ordered: false },
    check: sqlCheck({ ordered: false, ok: "Una línea por ciudad, con su precio más bajo. El folleto ya tiene texto." }),
    hints: [
      "El SELECT lleva destino, COUNT(*) AS vuelos y MIN(precio) AS desde. Al final, agrupa por destino.",
      "Después del FROM vuelos va GROUP BY destino.",
      "SELECT destino, COUNT(*) AS vuelos, MIN(precio) AS desde FROM vuelos GROUP BY destino;",
    ],
    debrief: [
      { who: "pat", text: "El jefe de programación se pasó por aquí. Miró la pantalla un buen rato y se fue sin decir nada.", mood: "serio" },
      { who: "fenton", text: "Eso, en este edificio, es un aplauso.", mood: "alegre" },
    ],
  }),

  sqlMission({
    id: "lc8",
    act: 2,
    giver: "pat",
    title: "Caben todos",
    concept: "HAVING",
    briefing: [
      { who: "pat", text: "Los de las aspiradoras otra vez. Ahora son treinta y quieren viajar todos a la misma ciudad, aunque sea en varios vuelos." },
      { who: "pat", text: "Necesito los destinos donde, sumando todos sus vuelos, quedan 30 plazas libres o más." },
      { who: "nora", text: "Eso es agrupar por destino y luego filtrar los grupos. Pero el WHERE filtra filas, no grupos..." },
    ],
    lesson: {
      title: "Filtrar grupos",
      body: "`WHERE` filtra filas antes de agrupar, así que no puede usar `COUNT`, `SUM` ni las demás funciones de resumen. Para quedarte con algunos grupos se usa `HAVING` con la condición, justo después del `GROUP BY`.",
      example: "SELECT genero, COUNT(*) AS libros FROM libros GROUP BY genero HAVING COUNT(*) >= 3;",
    },
    task: "De la tabla `vuelos`, saca `destino` y la suma de `plazas_libres` `AS plazas` (en ese orden), una fila por destino, solo de los destinos donde esa suma es 30 o más.",
    borrowed: [VUELOS_FORMA],
    cases: CINTA,
    sql: {
      solution: "SELECT destino, SUM(plazas_libres) AS plazas FROM vuelos GROUP BY destino HAVING SUM(plazas_libres) >= 30",
      ordered: false,
    },
    check: sqlCheck({ ordered: false, ok: "Treinta vendedores, una ciudad. Que tiemblen las alfombras." }),
    hints: [
      "Primero agrupa por destino con SUM(plazas_libres) AS plazas, como en la misión anterior.",
      "Después del GROUP BY destino añade HAVING SUM(plazas_libres) >= 30.",
      "SELECT destino, SUM(plazas_libres) AS plazas FROM vuelos GROUP BY destino HAVING SUM(plazas_libres) >= 30;",
    ],
    debrief: [
      { who: "pat", text: "La aerolínea quiere venir a verlo. Los directivos. Aquí. En persona.", mood: "sorpresa" },
      { who: "fenton", text: "¿Aquí? Tengo que ordenar el cuarto. Tengo que ordenar las relaciones.", mood: "sorpresa" },
      { who: "pat", text: "Y yo tengo que contarte lo que pasa con las reservas. No te va a gustar.", mood: "serio" },
    ],
  }),

  // ---------------------------------------------------------------- Acto 3
  sqlMission({
    id: "lc9",
    act: 3,
    giver: "pat",
    title: "Dos tablas",
    concept: "JOIN ... ON",
    briefing: [
      { who: "pat", text: "En las tarjetas, cada reserva lleva copiados el nombre y el teléfono del pasajero. Ana Ruiz viaja mucho: tiene tres teléfonos distintos." },
      { who: "fenton", text: "Porque el dato está repetido. Si cambia, cambia en un sitio y en los otros no. Por eso lo separé en dos tablas.", mood: "serio" },
      { who: "fenton", text: "Cada pasajero, una sola vez en pasajeros. Cada reserva, en reservas, apunta a su pasajero con pasajero_id." },
      { who: "pat", text: "Muy bonito. Pero el piloto quiere la lista de embarque con nombres, no con números." },
    ],
    lesson: {
      title: "Unir dos tablas",
      body: "Cuando una tabla guarda el id de otra, se pueden unir: `FROM tabla1 JOIN tabla2 ON condicion` pega cada fila de la primera con la fila de la segunda que cumple la condición. La condición suele ser que el id coincida, y como las dos tablas tienen una columna `id`, se dice de cuál es cada una: `tabla.columna`. Después puedes pedir columnas de las dos.",
      example: "SELECT titulo, nombre FROM prestamos JOIN socios ON prestamos.socio_id = socios.id;",
    },
    task: "Une `reservas` con `pasajeros` (el `pasajero_id` de cada reserva es el `id` de un pasajero) y pide `nombre` y `asiento`, en ese orden, de todas las reservas.",
    borrowed: TABLAS_ACTO3,
    cases: ARCHIVO(),
    sql: { solution: "SELECT nombre, asiento FROM reservas JOIN pasajeros ON reservas.pasajero_id = pasajeros.id", ordered: false },
    check: sqlCheck({ ordered: false, ok: "Cada asiento con su nombre. El nombre, escrito una sola vez." }),
    hints: [
      "Empieza con FROM reservas JOIN pasajeros y después di con ON cómo encajan.",
      "La condición es reservas.pasajero_id = pasajeros.id",
      "SELECT nombre, asiento FROM reservas JOIN pasajeros ON reservas.pasajero_id = pasajeros.id;",
    ],
    debrief: [
      { who: "nora", text: "Si Ana cambia de teléfono, se cambia en un solo sitio y todas sus reservas lo ven." },
      { who: "fenton", text: "¡Eso es una relación! Las tablas no se copian, se señalan.", mood: "alegre" },
      { who: "pat", text: "Cuarenta mil tarjetas pidiendo a gritos que alguien les dijera eso.", mood: "alegre" },
    ],
  }),

  sqlMission({
    id: "lc10",
    act: 3,
    giver: "pat",
    title: "Los que faltan",
    concept: "LEFT JOIN",
    briefing: [
      { who: "pat", text: "La aerolínea tiene apuntados pasajeros que este mes no han reservado nada. Quiere llamarlos con una oferta." },
      { who: "nora", text: "Pero si uno con JOIN, los que no tienen reserva no salen. No hay nada con qué pegarlos." },
      { who: "fenton", text: "Entonces pégalos con nada. Hay una unión que guarda a todos, aunque estén solos.", mood: "alegre" },
    ],
    lesson: {
      title: "Encontrar lo que no tiene pareja",
      body: "`LEFT JOIN` funciona como `JOIN`, pero guarda todas las filas de la tabla de la izquierda (la del `FROM`), aunque no encuentren pareja. A esas filas, las columnas de la otra tabla les quedan vacías, y vacío en SQL se llama `NULL`. Para quedarte solo con las que no tienen pareja se escribe `WHERE otra.id IS NULL` (con `IS`, no con `=`).",
      example: "SELECT nombre FROM socios LEFT JOIN prestamos ON prestamos.socio_id = socios.id WHERE prestamos.id IS NULL;",
    },
    task: "Pide `nombre` y `telefono` (en ese orden) de los `pasajeros` que no tienen ninguna fila en `reservas`. Usa `pasajeros LEFT JOIN reservas`.",
    borrowed: TABLAS_ACTO3,
    cases: ARCHIVO(),
    sql: {
      solution: "SELECT nombre, telefono FROM pasajeros LEFT JOIN reservas ON reservas.pasajero_id = pasajeros.id WHERE reservas.id IS NULL",
      ordered: false,
    },
    check: sqlCheck({ ordered: false, ok: "Los pasajeros sin reserva, con su teléfono. A llamar." }),
    hints: [
      "Parte de pasajeros, une con LEFT JOIN reservas ON reservas.pasajero_id = pasajeros.id, y filtra las filas sin reserva.",
      "El filtro es WHERE reservas.id IS NULL",
      "SELECT nombre, telefono FROM pasajeros LEFT JOIN reservas ON reservas.pasajero_id = pasajeros.id WHERE reservas.id IS NULL;",
    ],
    debrief: [
      { who: "pat", text: "Esto con tarjetas no se puede. Lo que no existe no tiene tarjeta.", mood: "sorpresa" },
      { who: "pat", text: "Vale. Lo digo una vez: es útil. No lo repitas por el pasillo.", mood: "serio" },
    ],
  }),

  sqlMission({
    id: "lc11",
    act: 3,
    giver: "pat",
    title: "La rebaja de Reno",
    concept: "UPDATE ... WHERE",
    briefing: [
      { who: "pat", text: "Mañana vienen los directivos y la tabla está vieja: ayer la aerolínea bajó 10 dólares todos los vuelos a Reno." },
      { who: "pat", text: "Con tarjetas, eso es perforar tarjetas nuevas. Con tu tabla, ¿se puede cambiar sin romper nada?" },
      { who: "fenton", text: "Se puede. Pero con cuidado: una orden sin condición cambia la tabla entera.", mood: "serio" },
    ],
    lesson: {
      title: "Cambiar datos",
      body: "`UPDATE tabla SET columna = valor WHERE condicion` cambia las filas que cumplen la condición. El valor puede calcularse con la propia columna: `SET sueldo = sueldo + 50` suma 50 a lo que hubiera. Sin `WHERE`, cambia todas las filas de la tabla, así que no lo olvides.",
      example: "UPDATE empleados SET sueldo = sueldo + 50 WHERE ciudad = 'Boston';",
    },
    task: "En la tabla `vuelos`, baja 10 dólares el `precio` de los vuelos cuyo `destino` es `'Reno'`. Calcula el precio nuevo a partir del que ya tienen, sin escribir el número a mano. El resto de vuelos no cambia.",
    borrowed: TABLAS_ACTO3,
    cases: ARCHIVO(),
    sql: {
      solution: "UPDATE vuelos SET precio = precio - 10 WHERE destino = 'Reno'",
      verify: "SELECT id, numero, destino, precio FROM vuelos ORDER BY id",
      ordered: true,
    },
    check: sqlCheck({ ordered: true, ok: "Reno, 10 dólares más barato. Lo demás, intacto." }),
    hints: [
      "La forma es UPDATE vuelos SET precio = ... WHERE ...",
      "El precio nuevo es precio - 10, y solo donde destino = 'Reno'.",
      "UPDATE vuelos SET precio = precio - 10 WHERE destino = 'Reno';",
    ],
    debrief: [
      { who: "nora", text: "Comprobé la tabla después. Solo cambió Reno." },
      { who: "fenton", text: "Mañana, la gran pregunta. Delante de todos.", mood: "serio" },
    ],
  }),

  sqlMission({
    id: "lc12",
    act: 3,
    giver: "fenton",
    title: "La gran pregunta",
    concept: "JOIN + GROUP BY + ORDER BY",
    briefing: [
      { who: "narrador", text: "Sala de juntas. Seis directivos de Aerolíneas Pacífico, el jefe de programación y una terminal con un cable muy largo." },
      { who: "pat", text: "Quieren saber qué destino les deja más dinero. Su gente tardó dos meses y no se pusieron de acuerdo." },
      { who: "fenton", text: "Nora, cada reserva paga el precio de su vuelo. Por destino: cuántas reservas y cuánto dinero, del que más al que menos." },
      { who: "nora", text: "Una consulta. Delante de todos. Sin presión.", mood: "serio" },
    ],
    lesson: {
      title: "Todo junto",
      body: "Las piezas se combinan en este orden: `SELECT ... FROM ... JOIN ... ON ... GROUP BY ... ORDER BY ...`. Primero se unen las tablas, después se agrupa y al final se ordena. En el `ORDER BY` puedes usar el nombre que pusiste con `AS`.",
      example: "SELECT ciudad, SUM(importe) AS total FROM pedidos JOIN clientes ON pedidos.cliente_id = clientes.id GROUP BY ciudad ORDER BY total DESC;",
    },
    task: "Une `reservas` con `vuelos` (el `vuelo_id` de cada reserva es el `id` de un vuelo). Agrupa por `destino` y saca tres columnas en este orden: `destino`, el número de reservas `AS reservas` y la suma de `precio` `AS ingresos`. Ordena de mayor a menor `ingresos`.",
    borrowed: TABLAS_ACTO3,
    cases: ARCHIVO(true),
    sql: {
      solution:
        "SELECT destino, COUNT(*) AS reservas, SUM(precio) AS ingresos FROM reservas JOIN vuelos ON reservas.vuelo_id = vuelos.id GROUP BY destino ORDER BY ingresos DESC",
      ordered: true,
    },
    check: sqlCheck({ ordered: true, ok: "La respuesta, en la pantalla, delante de toda la junta." }),
    hints: [
      "Junta lo que ya sabes: el JOIN de la misión de las dos tablas, el GROUP BY del folleto y el ORDER BY de las ofertas.",
      "FROM reservas JOIN vuelos ON reservas.vuelo_id = vuelos.id GROUP BY destino ORDER BY ingresos DESC",
      "SELECT destino, COUNT(*) AS reservas, SUM(precio) AS ingresos FROM reservas JOIN vuelos ON reservas.vuelo_id = vuelos.id GROUP BY destino ORDER BY ingresos DESC;",
    ],
    debrief: [
      { who: "narrador", text: "La respuesta sale en dos segundos. El destino con más reservas no es el que más dinero deja. Nadie en la sala lo esperaba." },
      { who: "pat", text: "El director pregunta si puede hacer otra pregunta. Y otra. Lleva doce.", mood: "alegre" },
    ],
  }),
];

// ------------------------------------------------------------------ historia

export const CONTENT: StoryContent = {
  intro: [
    { who: "narrador", text: "San José, California, 1974. Laboratorio de investigación de la Compañía Continental de Máquinas Contables." },
    { who: "narrador", text: "Aquí los datos viven en cintas y en cajas de tarjetas perforadas. Cada pregunta nueva necesita un programa nuevo. Y un programa nuevo tarda semanas." },
    { who: "pat", text: "Tú eres la nueva. Nora, ¿verdad? Soy Pat, llevo el archivo. Cuarenta mil tarjetas, y sé dónde está cada una." },
    { who: "fenton", text: "¡Nora! Llegas a tiempo. Tengo una idea: todo en tablas, y preguntas en un lenguaje casi inglés. Sin programas nuevos.", mood: "alegre" },
    { who: "pat", text: "Lleva tres años diciéndolo. La empresa le ha dado un cuarto sin ventana y una terminal.", mood: "serio" },
    { who: "nora", text: "Yo no sé lo que es una tabla. Bueno, una de comer sí." },
    { who: "fenton", text: "¡Perfecto! Así no tienes nada que desaprender.", mood: "alegre" },
  ],
  acts: [
    {
      n: 1,
      title: "Preguntar",
      date: "Marzo de 1974",
      opening: [
        { who: "narrador", text: "Aerolíneas Pacífico, el mayor cliente del laboratorio, llama cada día con una pregunta nueva." },
        { who: "narrador", text: "Programación promete respuestas para dentro de seis semanas. Fenton promete respuestas para esta tarde." },
      ],
    },
    {
      n: 2,
      title: "Resumir",
      date: "Abril de 1974",
      opening: [
        { who: "narrador", text: "Ahora hay cola en el cuarto sin ventana. Pat baja cada mañana con las preguntas de la aerolínea." },
        { who: "narrador", text: "Y ya no piden listas. Piden números: cuántos, cuánto, de media, por ciudad." },
      ],
    },
    {
      n: 3,
      title: "Relacionar",
      date: "Mayo de 1974",
      opening: [
        { who: "narrador", text: "Los directivos de Aerolíneas Pacífico vienen al laboratorio a final de mes. Quieren ver el invento con sus propios ojos." },
        { who: "narrador", text: "Antes, Fenton y Nora tienen que arreglar lo que las tarjetas nunca arreglaron: datos que se repiten y se contradicen." },
      ],
    },
  ],
  missions: MISSIONS,
  ending: [
    { who: "narrador", text: "Esa misma semana, la aerolínea pide tres terminales. La empresa le da a Fenton un cuarto con ventana." },
    { who: "pat", text: "Las tarjetas se quedan en el archivo. Por si acaso. Pero ya no bajo a buscarlas.", mood: "alegre" },
    { who: "fenton", text: "Me dijeron que nadie aprendería un lenguaje para preguntar. Y aprendiste tú en tres meses.", mood: "alegre" },
    { who: "nora", text: "Al principio pensaba que hacía falta ser programadora para sacarle algo a los datos." },
    { who: "nora", text: "Pero basta con saber qué quieres preguntar: qué columnas, qué filas, cómo agrupar y cómo unir." },
    { who: "pat", text: "Ahora el director hace sus propias consultas. Y se equivoca con las comillas, como todos.", mood: "alegre" },
    { who: "narrador", text: "El lenguaje que nadie quería se quedó. Medio siglo después, sigue respondiendo preguntas en casi todas partes." },
  ],
};
