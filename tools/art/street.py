"""Lo que pasa por la calle en el viaje en bici: casas de madera de Berkeley,
farolas y árboles. Mismo estilo que todo el juego: colores planos con una
sombra, y contorno de tinta de 1 px.

Salida: public/assets/street.png (cuadros de 64x60)
  0-2 casas (crema, verde salvia, terracota), 3 farola,
  4 árbol verde, 5 árbol de otoño, 6 árbol nevado
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "public", "assets", "street.png")
PREV = os.path.join(HERE, "preview", "street.png")
W, H = 64, 60
INK = (28, 24, 48, 255)


def rgb(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


class C:
    def __init__(self):
        self.im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        self.px = self.im.load()

    def put(self, x, y, c):
        if 0 <= x < W and 0 <= y < H:
            self.px[x, y] = rgb(c) if isinstance(c, str) else c

    def rect(self, x, y, w, h, c):
        for j in range(y, y + h):
            for i in range(x, x + w):
                self.put(i, j, c)

    def disc(self, cx, cy, r, c):
        for j in range(cy - r, cy + r + 1):
            for i in range(cx - r, cx + r + 1):
                if (i - cx) ** 2 + (j - cy) ** 2 <= r * r + r * 0.6:
                    self.put(i, j, c)

    def outline(self):
        src = self.im.copy().load()
        for y in range(H):
            for x in range(W):
                if src[x, y][3]:
                    continue
                if any(0 <= x + dx < W and 0 <= y + dy < H and src[x + dx, y + dy][3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    self.px[x, y] = INK


def house(wall, shade, roof, roof_s, trim):
    c = C()
    base = H - 1
    # tejado a dos aguas
    for i in range(16):
        y = base - 34 - i
        c.rect(4 + i, y, 56 - 2 * i, 1, roof if i % 3 else roof_s)
    c.rect(2, base - 34, 60, 2, roof_s)
    # fachada de tablas
    c.rect(6, base - 32, 52, 32, wall)
    for y in range(base - 32, base, 3):
        c.rect(6, y, 52, 1, shade)
    c.rect(6, base - 32, 52, 1, trim)
    # ventanas con marco y reflejo
    for wx in (11, 41):
        c.rect(wx - 1, base - 26, 13, 12, trim)
        c.rect(wx, base - 25, 11, 10, "#3a5a8a")
        c.rect(wx, base - 25, 11, 2, "#8fd3ff")
        c.rect(wx + 5, base - 25, 1, 10, trim)
        c.rect(wx - 2, base - 14, 15, 1, trim)
    # puerta y escalón
    c.rect(26, base - 19, 12, 19, trim)
    c.rect(27, base - 18, 10, 18, "#6e4c3c")
    c.rect(28, base - 16, 8, 6, "#5e3c26")
    c.put(35, base - 9, "#fed018")
    c.rect(24, base - 1, 16, 1, "#968a74")
    c.outline()
    return c.im


def lamp():
    c = C()
    base = H - 1
    c.rect(30, base - 44, 3, 44, "#2e2a48")
    c.rect(31, base - 44, 1, 44, "#4a4470")
    c.rect(28, base - 2, 7, 2, "#2e2a48")
    c.rect(26, base - 50, 11, 3, "#2e2a48")
    c.rect(27, base - 47, 9, 3, "#fed018")
    c.rect(28, base - 47, 3, 1, "#fff4c9")
    c.outline()
    return c.im


def tree(leaf, leaf_s, leaf_l, snow=False):
    """Copa irregular hecha de racimos pequeños, sombra abajo a la derecha y
    luz arriba a la izquierda con tramado, para que no parezca una bola."""
    import random
    rnd = random.Random(7)
    c = C()
    base = H - 1
    # tronco con dos ramas
    c.rect(29, base - 24, 4, 24, "#5e3c26")
    c.rect(29, base - 24, 1, 24, "#7a4e32")
    for i in range(6):
        c.put(28 - i, base - 24 - i, "#5e3c26")
        c.put(33 + i, base - 26 - i, "#5e3c26")
    clusters = []
    for _ in range(26):
        ang = rnd.uniform(0, 6.283)
        d = rnd.uniform(0, 1) ** 0.6
        x = 31 + int(19 * d * __import__("math").cos(ang))
        y = base - 40 + int(13 * d * __import__("math").sin(ang))
        clusters.append((x, y, rnd.randint(3, 5)))
    clusters.sort(key=lambda t: t[1])
    for x, y, r in clusters:
        c.disc(x, y, r, leaf_s)
    for x, y, r in clusters:
        for j in range(y - r, y + r + 1):
            for i in range(x - r, x + r + 1):
                if (i - x) ** 2 + (j - y) ** 2 <= (r - 1) ** 2 and (i - x) + (j - y) < r - 1:
                    c.put(i, j, leaf)
    for x, y, r in clusters:
        if y < base - 40 or x < 28:
            for j in range(y - r + 1, y):
                for i in range(x - r + 1, x):
                    if (i - x) ** 2 + (j - y) ** 2 <= (r - 1) ** 2 and (i + j) % 2 == 0:
                        c.put(i, j, leaf_l)
    if snow:
        for x, y, r in clusters:
            if y < base - 36:
                c.rect(x - r + 2, y - r + 1, 2 * r - 3, 1, "#ffffff")
    c.outline()
    return c.im


def build():
    frames = [
        house("#e2cfa6", "#cbb68c", "#8a5a3a", "#6e4c3c", "#fff4c9"),
        house("#a9c4b4", "#8fae9c", "#5e3c26", "#4a2e1e", "#efe4cc"),
        house("#c98f6a", "#b07a58", "#4a4470", "#3a3460", "#fff4c9"),
        lamp(),
        tree("#4b8139", "#3f6b3a", "#79b894"),
        tree("#c87a2e", "#8a5a2e", "#e8a85a"),
        tree("#6f8f96", "#4f6f78", "#c8d8de", snow=True),
    ]
    sheet = Image.new("RGBA", (W * len(frames), H), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.alpha_composite(f, (i * W, 0))
    sheet.save(OUT)
    prev = Image.new("RGBA", sheet.size, (120, 150, 190, 255))
    prev.alpha_composite(sheet)
    prev.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save(PREV)
    print("ok", sheet.size)


if __name__ == "__main__":
    build()
