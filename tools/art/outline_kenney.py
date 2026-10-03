"""Contorno de tinta para los muebles de Kenney.

Regla de estilo del juego: todo objeto lleva un contorno de 1 píxel en tinta
(#1c1830), como los personajes y los props propios. Los tiles de Kenney no lo
traen, así que se lo añadimos: cada píxel opaco que toca transparencia pasa a
tinta. En el borde de un tile se mira el tile vecino (la hoja tiene 1 px de
separación), para que los muebles de varios tiles (piano, alfombra, estantería)
no queden con costuras en medio.

Fuente: tools/art/source/kenney_indoor.png  ->  public/assets/vendor/kenney_indoor.png
"""
import os
import shutil
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source", "kenney_indoor.png")
OUT = os.path.join(HERE, "..", "..", "public", "assets", "vendor", "kenney_indoor.png")
INK = (28, 24, 48, 255)
T, STEP = 16, 17

# Muebles de varios tiles: dentro de cada grupo no se dibuja contorno entre piezas.
# (col0, fila0, col1, fila1) inclusive. Fuera de estos grupos, el borde del tile es borde.
GROUPS = [
    (23, 8, 24, 9),   # piano
    (0, 9, 2, 9),     # alfombra (cada fila es una alfombra)
    (0, 12, 9, 12),   # muebles de cocina en fila
    (19, 17, 21, 17), # estanterías bajas
    (20, 12, 21, 12), # mapa ancho
    (20, 13, 21, 13), # vista de ciudad ancha
    (20, 14, 21, 14), # mapamundi ancho
    (19, 15, 19, 16), # cuadros altos
    (20, 15, 20, 16),
    (21, 15, 21, 16),
    (22, 14, 22, 15), # espejo alto
    (12, 0, 13, 1),   # camas dobles
    (14, 0, 15, 1),
    (12, 2, 13, 3),
    (14, 2, 15, 3),
]


def same_group(a, b):
    return any(c0 <= a[0] <= c1 and r0 <= a[1] <= r1 and c0 <= b[0] <= c1 and r0 <= b[1] <= r1 for c0, r0, c1, r1 in GROUPS)


def build():
    if not os.path.exists(SRC):
        shutil.copy(OUT, SRC)
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    px = im.load()
    out = im.copy()
    op = out.load()

    def opaque(x, y):
        return 0 <= x < w and 0 <= y < h and px[x, y][3] > 0

    def neighbor(x, y, dx, dy):
        """Píxel vecino; si cruza el borde del tile, salta la separación de 1 px."""
        lx, ly = x % STEP, y % STEP
        nx, ny = x + dx, y + dy
        crosses = (dx == 1 and lx == T - 1) or (dx == -1 and lx == 0) or (dy == 1 and ly == T - 1) or (dy == -1 and ly == 0)
        if crosses and not same_group((x // STEP, y // STEP), ((x // STEP) + dx, (y // STEP) + dy)):
            return False
        if dx == 1 and lx == T - 1:
            nx += 1
        if dx == -1 and lx == 0:
            nx -= 1
        if dy == 1 and ly == T - 1:
            ny += 1
        if dy == -1 and ly == 0:
            ny -= 1
        return opaque(nx, ny)

    for y in range(h):
        for x in range(w):
            if x % STEP == T or y % STEP == T or not opaque(x, y):
                continue
            if not all(neighbor(x, y, dx, dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                op[x, y] = INK
    out.save(OUT)
    print("ok", out.size)


if __name__ == "__main__":
    build()
