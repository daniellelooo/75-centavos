# 75 Centavos

Juego pixel art para aprender JavaScript desde cero. Berkeley, 1986: la contabilidad
del laboratorio no cuadra por 75 centavos y, tirando del hilo, aparece un intruso que
entra de noche desde el otro lado del océano. Inspirado en hechos reales; personajes y
nombres ficticios.

El jugador escribe **JavaScript real** en una terminal CRT y cada misión enseña una
palabra del lenguaje justo cuando la historia la necesita.

## Estado: MVP — Acto 1 "El descuadre"

| Misión | Concepto |
|---|---|
| La factura | variables (`let`), `console.log` |
| El descuadre | operaciones |
| Una cuenta sin dueño | textos y plantillas `${}` |
| Turno de madrugada | `if` / `else`, comparaciones |
| Noches en vela | bucles `for` |

Cierra con el rastreo de la llamada en un mapa de red de 1986.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # validadores de misiones (vitest)
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
