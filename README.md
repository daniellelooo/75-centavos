# 75 Centavos

Juego pixel art para aprender JavaScript desde cero. Berkeley, 1986: la contabilidad
del laboratorio no cuadra por 75 centavos y, tirando del hilo, aparece un intruso que
entra de noche desde el otro lado del océano. Inspirado en hechos reales; personajes y
nombres ficticios.

El jugador escribe **JavaScript real** en una terminal CRT y cada misión enseña una
palabra del lenguaje justo cuando la historia la necesita.

## Estado: actos 1 a 3 jugables (~2-3 horas)

| Acto | Misiones | Conceptos |
|---|---|---|
| 1 · El descuadre (agosto 1986) | La factura, El descuadre, Una cuenta sin dueño, Turno de madrugada, Noches en vela | `let`, operaciones, plantillas, `if/else`, `for` |
| 2 · La trampa (septiembre 1986) | Tres nombres, Solo de madrugada, La alarma de bolsillo, Minutos en línea, El anzuelo | arrays, recorrer y `push`, funciones, parámetros y `return` |
| 3 · El rastro (diciembre 1986) | Ficha de conexión, El expediente, Filtrar el ruido, Lo que busca, Hora y media | objetos, arrays de objetos, `filter`, `map`, `for...of` y acumuladores |

Cada acto termina con el rastreo de la llamada en un mapa de red de 1986.

**Cuaderno de Sam** (tecla C): mapa de ruta de lo aprendido, ficha de cada concepto,
pregunta de "¿qué imprime?" y práctica en la terminal sin tocar el progreso.

**Menú de pausa** (Esc): radio con dos emisoras, volúmenes, pantalla completa y controles.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # misiones y preguntas del cuaderno (vitest)
npm run build      # tipos + build de producción
python3 tools/art/build_art.py   # regenera el arte propio en public/assets
python3 tools/art/characters.py  # regenera los personajes
```

## Cómo está hecho

- **Vite + TypeScript + Phaser 4** para el mundo; la interfaz (diálogos, terminal,
  corcho) es DOM encima del canvas.
- **CodeMirror 6** como editor, con autocompletado (Tab) de lo que el jugador ya aprendió.
- El código del jugador corre en un **Web Worker** con límite de 1,5 s (un bucle
  infinito no congela el juego) y en modo estricto. Cada misión lo prueba contra varios
  casos, para que escribir el resultado a mano no sirva. Ver `src/game/missions.ts`.
- Resolución interna 480x270 escalada por enteros: píxeles nítidos.
- Luz nocturna calculada por píxel con tramado Bayer (`src/scenes/lighting.ts`).
- Sonido generado por código con ZzFX; la radio del laboratorio sintetiza su música con Web Audio.

## Arte y licencias

- Arte propio (suelo, paredes, terminales, minicomputadora, impresora, corcho, pizarra,
  gata, telescopio, mapa…): `tools/art/build_art.py`, dibujado píxel a píxel con una
  paleta común.
- Personajes propios (Sam, Ruth, Kessler): `tools/art/characters.py`.
- Algunos muebles: **Roguelike Indoors** de Kenney (CC0).
- Fuentes: Pixelify Sans, Press Start 2P y VT323 (OFL, Google Fonts).

Licencias en `public/assets/vendor/`.
