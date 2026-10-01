# 75 Centavos — MVP (spec)

Fecha: 2026-10-01 · Estado: aprobado por Daniel (enfoque A, "MVP sin mucho detalle, pixel art bien hecho")

## Qué es

Juego pixel art para aprender JavaScript desde cero hasta nivel medio (~10 h en la
versión completa). Noir cozy inspirado en hechos reales: Berkeley, 1986, un astrónomo
hereda el ordenador del laboratorio, la contabilidad descuadra 75 centavos y tirando
del hilo aparece un intruso que entra de noche desde el otro lado del océano.
Personajes y nombres **ficticios**, "inspirado en hechos reales".

Referencias de diseño: The Farmer Was Replaced (el código actúa en un mundo visible,
cada desbloqueo es una palabra del lenguaje), Dave the Diver (dos bucles que se
alimentan: día/noche), Balatro (feedback sonoro y numérico al ejecutar).

## Bucle (versión completa)

- **Día — laboratorio:** caminas una planta pequeña, hablas con colegas, aceptas
  encargos en la terminal (cuadrar cuentas, informes). Enseñan lo básico.
- **Noche — mapa de red:** mapa de 1986 con nodos. El intruso salta de nodo en nodo;
  tu código pone alarmas, filtra rastros, tiende trampas.
- **Corcho:** cada pista resuelta se clava y se conecta con hilo rojo.

10 actos (~60 min) siguiendo la progresión común de freeCodeCamp / Odin /
javascript.info / Eloquent JS: valores → decisiones → bucles → funciones → arrays →
objetos → orden superior (muro 1, primera trampa) → closures → clases → async
(muro 2, persecución final en tiempo real).

## Alcance del MVP (esto es lo que se construye ahora)

Prioridad #1: **que se vea bien**. Contenido corto.

1. **Pantalla de título** con escena pixel art del laboratorio de noche.
2. **Laboratorio** (Phaser 4): una sala top-down, personaje con caminata en 4
   direcciones, colisiones, objetos interactuables (terminal, cafetera, colega,
   corcho, ventana). Diálogos en caja pixel.
3. **Terminal** (DOM sobre el canvas): CRT ámbar, CodeMirror 6 con JS real, panel de
   misión, botón Ejecutar, salida tipo consola, errores traducidos al español.
4. **Mapa de red** de noche: nodos y enlaces, el intruso animado recorriendo la ruta,
   la alarma del jugador se dispara.
5. **Acto 1 "El descuadre"** — 5 misiones:
   - M1 `let` / números: anotar el total del mes.
   - M2 operaciones: calcular la diferencia → aparece 0.75.
   - M3 strings y `===`: ¿quién es el usuario "hunter"?
   - M4 `if`: alarma si el usuario no está en la lista.
   - M5 `for` sobre el log: contar sesiones nocturnas → noche en el mapa → cliffhanger.
6. **Guardado** local (localStorage) y continuar.

Fuera del MVP: actos 2-10, corcho interactivo completo, sonido elaborado (solo
efectos ZzFX básicos), app de escritorio (Tauri), paso a paso línea a línea.

## Técnica

- Vite + TypeScript, Phaser 4 (mundo), DOM/CSS (UI y terminal), CodeMirror 6.
- Código del jugador en **Web Worker** con tiempo límite (bucles infinitos se
  cortan con `terminate()`); la misión valida resultado con checks propios.
- Resolución interna fija y escalado entero (`pixelArt: true`), sin suavizado.
- Arte: packs gratuitos con licencia compatible + piezas propias con la misma
  paleta. Nada de sprites generados por IA (inconsistentes).
- Pruebas: Vitest (validadores de misiones), Playwright (flujo real en navegador).
- Hosting gratis (Vercel / GitHub Pages). Cero emojis en la UI.
