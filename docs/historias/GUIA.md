# Guía para escribir una historia de Eternal Games

Cada historia es un juego corto (unos 60 minutos) con la misma mecánica que 75 Centavos:
un lugar, tres personajes, 3 actos de 4 misiones. En cada misión un personaje da un
encargo (diálogo), el jugador lo resuelve en la terminal y se cierra con otro diálogo.
La terminal enseña el concepto con una lección corta, un ejemplo y pistas.

Lee antes, para copiar el tono y el nivel de detalle:

- `src/game/acts/act1.ts` y `src/game/acts/act3.ts` (misiones de 75 Centavos)
- `src/game/training.ts` (ejercicios cortos, con lección, encargo y pistas)
- `src/stories/types.ts` (el formato) y `src/game/types.ts` (`Exercise`, `Line`, `TestCase`)
- `src/config.ts` (`CHAR`: las claves de personaje válidas)

## Qué escribes

Un archivo `src/stories/<id>/content.ts` que exporta:

```ts
import type { StoryContent } from "../types";
export const CONTENT: StoryContent = { intro, acts, missions, ending };
```

y un archivo `tests/story-<id>.test.ts` con pruebas de errores típicos (ver abajo).
No toques ningún otro archivo. No hagas commits ni ninguna operación de git.

## Reglas de contenido (no negociables)

- Todo en español neutro, claro, para alguien que aprende. Frases cortas.
- Cero emojis. Nada de markdown dentro de los diálogos.
- Personajes y nombres ficticios. La historia se inspira en hechos reales, sin nombrar
  personas reales ni empresas reales (inventa nombres de empresa).
- La historia manda: cada misión existe porque la historia la necesita ("hay que saber
  cuántos vuelos salen mañana", no "practica COUNT").
- Humor ligero, como 75 Centavos. Nada de chistes forzados.
- `who` de cada línea: una clave de `CHAR` de tu reparto, o `"narrador"` o `"sistema"`.
  `mood` (opcional): `"normal" | "sorpresa" | "serio" | "alegre"`. Usa los moods: dan vida.
- Cada línea de diálogo: menos de 200 caracteres. Briefing de 2 a 4 líneas; debrief de 1 a 3.
- `intro`: 4 a 7 líneas que presentan el lugar, el problema y al jugador.
  `ending`: 5 a 9 líneas que cierran la historia con emoción y una mirada a lo aprendido.
- `acts[i].opening`: 2 o 3 líneas del narrador (como en 75 Centavos).

## Reglas de cada misión

- `id`: prefijo de la historia + número (`dd1` ... `dd12`). `act`: 1, 2 o 3 (4 por acto, en orden).
- `giver`: el personaje que da el encargo (de tu reparto, no el jugador).
- `title`: 2 a 4 palabras. `concept`: el concepto en pocas palabras ("querySelector", "WHERE").
- `lesson.body`: explica el concepto desde cero en 2 a 4 frases. Lo que va entre
  `comillas invertidas` se pinta como código. No uses nada que no se haya explicado antes.
- `lesson.example`: ejemplo corto y DISTINTO de la solución. En JavaScript, cada
  `console.log(...)` puede llevar el resultado en un comentario al final de la línea
  (`console.log(x); // 5`): el juego lo tapa para que el jugador adivine primero.
- `task`: qué hay que hacer exactamente, nombrando las variables, funciones, elementos o
  columnas con comillas invertidas. Si hay datos ya cargados, di cómo son.
- `starter`: `"// Escribe tu código debajo de esta línea\n"` (o `"-- Escribe tu consulta debajo\n"` en SQL).
  Puede traer una plantilla, pero NO debe aprobar tal cual.
- `borrowed`: lo que ya está cargado. En JS, nombres de variables o funciones; si das solo
  el nombre (`"contactos"`), la terminal enseña su valor real de ejemplo. En SQL, la forma
  de las tablas: `"vuelos (id, origen, destino, plazas)"`. En DOM, `[]`.
- `cases`: al menos 2 casos con datos distintos (que no se pueda aprobar escribiendo el
  resultado a mano). `label` corto ("lunes", "el otro convoy").
- `check`: mensajes concretos y amables que digan qué falta ("Falta mostrarlo con
  console.log", "El título debería decir X y dice Y"). Nunca "incorrecto" a secas.
  El último mensaje (`pass: true`) es una frase corta de éxito ligada a la historia.
- `hints`: 2 o 3. La primera orienta, la segunda casi lo da, la ÚLTIMA ES LA SOLUCIÓN
  COMPLETA (código que aprueba tal cual: el test lo comprueba).
- `briefing` / `debrief`: la parte de historia. El debrief comenta el resultado y empuja
  hacia lo siguiente.

## Los tres tipos de terminal

### JavaScript (`sandbox` sin poner)

Como en 75 Centavos: `cases[i].globals()` presta variables y funciones; `capture` lista
las variables del jugador que el check lee en `o.values`; `o.logs` son las líneas que
imprimió con console.log; `probe` (opcional) es una expresión que se evalúa al final,
por ejemplo para llamar a la función que escribió el jugador:
`probe: "typeof cifrar === 'function' ? cifrar('HOLA', 3) : null"` y en el check `o.values.__probe`.
Para funciones con varios casos de prueba internos, el probe puede devolver un objeto o
una lista con varias llamadas.

### Página web (`sandbox: "dom"`)

El código del jugador corre sobre una página: `cases[i].globals()` devuelve
`{ __html: "<html>...</html>" }` (la página completa, con su `<style>` en el `<head>`;
la terminal la enseña antes y después de ejecutar, así que haz que se vea como una web
de 1995: fondo gris o con textura, Times, enlaces azules, tablas, un gif "en
construcción" dibujado con CSS si quieres). Casos con páginas distintas (otros textos u
otros elementos) para que no se pueda aprobar a mano.

Hay `document`, `window`, `console` y `alert` (queda en los logs como `[alert] texto`).
El `probe` es una expresión que se evalúa después del código y puede simular a una
persona con estas ayudas:

- `__click("#boton")`, `__type("#campo", "texto")` (pone el valor y lanza `input`),
  `__submit("#formulario")` (devuelve true si el código llamó a `preventDefault`),
  `__key("Enter")` (keydown en el documento),
- `__text("#sel")` (texto del elemento o null), `__count("li")` (cuántos hay), `__alerts()`.

Ejemplo de probe: `"(__click('#mas'), __click('#mas'), { total: __text('#total'), items: __count('#lista li') })"`.
El check lee `o.values.__probe` (y si quieres `o.values.__html`). Los eventos suben al
padre (delegación) y `e.target`, `classList`, `style`, `createElement`, `appendChild`,
`remove`, `dataset` y `value` funcionan. No uses `setTimeout`, `fetch` ni `localStorage`.

### SQL (`sandbox: "sql"`)

SQLite real. `cases[i].globals()` devuelve `{ __setup: "CREATE TABLE ...; INSERT ...;" }`
(los datos del caso; cambia los datos entre casos). La misión lleva
`sql: { solution: "SELECT ...", ordered: true|false }` (y `verify: "SELECT ..."` si la
misión es un INSERT, UPDATE o DELETE: se ejecuta después y se compara eso).
El check es el corrector común: `check: sqlCheck({ ordered: true, ok: "Frase de éxito." })`
(importa `sqlCheck` de `../../game/sandbox-sql`). Compara columnas (nombre y orden),
número de filas y valores con el resultado de `solution` sobre los mismos datos.
Si la solución usa `AS total`, el encargo lo tiene que pedir. `ordered: true` solo si el
encargo pide un orden (ORDER BY). `capture: []`, `probe` sin poner.
La última pista es la consulta completa; el `starter` en SQL no puede aprobar.

## Pruebas

Las pruebas comunes ya existen: `tests/stories.test.ts` comprueba para cada misión que la
última pista aprueba y el `starter` no, que hay 3 actos de 4 misiones, que quien habla
existe y que no hay emojis. Ejecuta: `npx vitest run tests/stories.test.ts -t "<id>"`.

Tu archivo `tests/story-<id>.test.ts` añade al menos 6 errores típicos con su mensaje
(un olvido de console.log, un nombre mal escrito, un resultado escrito a mano que falla en
el segundo caso, en SQL una fila de más por olvidar el WHERE...). Usa `grade` de
`src/game/run-local.ts`:

```ts
import { grade } from "../src/game/run-local";
import { CONTENT } from "../src/stories/<id>/content";
const m = (id: string) => CONTENT.missions.find((x) => x.id === id)!;
it("dd3: sin console.log", async () => {
  const r = await grade(m("dd3"), "let x = 1;");
  expect(r.pass).toBe(false);
  expect(r.feedback).toMatch(/console.log/);
});
```

Al terminar, todas las pruebas de tu historia tienen que pasar, y `npx tsc --noEmit` no
puede dar errores en tus archivos (los errores de otras historias que aún no existen no
son tuyos).
