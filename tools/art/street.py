"""Lo que pasa por la calle en el viaje en bici: casas de Berkeley, farolas y
árboles. Se pinta con el mismo pintor y la misma paleta por acto que el paisaje
de fondo (view.py): tramado Bayer, luz desde arriba a la izquierda y sin
contorno de tinta, para que delante y detrás parezcan un solo cuadro.

Salida: public/assets/street_{acto}.png (cuadros de 64x64)
  0-2 casas, 3 farola, 4 roble, 5 ciprés, 6 eucalipto
"""
import os
import random

from PIL import Image

import view as V

OUT = V.OUT.replace(os.path.join("assets", "view"), "assets")
FW, FH = 64, 64
KEY = (255, 0, 255)


def fresh():
    p = V.Painter()
    p.rect(0, 0, FW, FH, KEY)
    return p


def to_frame(p):
    im = p.im.crop((0, 0, FW, FH)).convert("RGBA")
    px = im.load()
    for y in range(FH):
        for x in range(FW):
            if px[x, y][:3] == KEY:
                px[x, y] = (0, 0, 0, 0)
    return im


def big_house(L, seed):
    """Casa de madera de dos aguas, pintada como las del fondo pero de cerca."""
    rnd = random.Random(seed)
    p = fresh()
    base = FH - 1
    wall = L["wall"][seed % len(L["wall"])]
    roof = L["roof"][seed % len(L["roof"])]
    shade = V.mix(wall, (0, 0, 0), 0.16)
    deep = V.mix(wall, (0, 0, 0), 0.32)
    x0, x1, h = 6, 58, 30
    # fachada de tablas, con sombra del alero y el lado derecho más oscuro
    for y in range(base - h, base):
        for x in range(x0, x1):
            c = wall
            if (y - base) % 3 == 0:
                c = shade
            if x >= x1 - 5 and V.BAYER[y % 4][x % 4] > 5:
                c = shade
            if y < base - h + 3 and V.BAYER[y % 4][x % 4] > 3:
                c = deep
            p.put(x, y, c)
    # tejado con tramado: más claro arriba a la izquierda
    rh = 17
    for k in range(rh):
        y = base - h - 1 - k
        for x in range(x0 - 3 + k, x1 + 3 - k):
            t = (x - x0) / (x1 - x0)
            c = roof
            if t > 0.55 and V.BAYER[y % 4][x % 4] > 6:
                c = V.mix(roof, (0, 0, 0), 0.22)
            if k > rh - 6 and t < 0.45 and V.BAYER[y % 4][x % 4] > 9:
                c = V.mix(roof, (255, 255, 255), 0.18)
            p.put(x, y, c)
    p.rect(x0 - 3, base - h - 1, x1 - x0 + 6, 1, V.mix(roof, (0, 0, 0), 0.35))
    if L.get("snow"):
        snow = V.SNOW
        for k in range(rh):
            y = base - h - 1 - k
            p.rect(x0 - 3 + k, y, 3, 1, snow)
            p.rect(x1 + 1 - k, y, 2, 1, V.mix(snow, (0, 0, 0), 0.1))
        p.rect(x0 + 13, base - h - rh, x1 - x0 - 26, 2, snow)
    trim = V.mix(wall, (255, 255, 255), 0.45)
    glass, glass_l = (58, 90, 138), (143, 190, 230)
    for wx in (11, 41):
        p.rect(wx - 1, base - 25, 13, 12, trim)
        p.rect(wx, base - 24, 11, 10, glass)
        for i in range(4):
            p.put(wx + 1 + i, base - 23 + i, glass_l)
        p.rect(wx + 5, base - 24, 1, 10, trim)
        p.rect(wx - 2, base - 13, 15, 1, deep)
    p.rect(26, base - 19, 12, 19, trim)
    p.rect(27, base - 18, 10, 18, (110, 76, 60))
    p.rect(27, base - 18, 2, 18, (130, 92, 72))
    p.put(35, base - 9, (254, 208, 24))
    if L.get("xmas"):
        cols = [(232, 52, 78), (75, 168, 109), (254, 208, 24), (32, 146, 219)]
        for x in range(x0 - 3, x1 + 3, 3):
            p.put(x, base - h, cols[(x // 3) % 4])
    # matorral delante de la casa
    for k in range(2):
        V.tree_blob(p, L, 8 + k * 46 + rnd.randrange(0, 4), base - 3, 5, seed + k)
    return to_frame(p)


def lamp(L):
    p = fresh()
    base = FH - 1
    iron, iron_l = (46, 42, 72), (74, 68, 112)
    p.rect(31, base - 46, 3, 46, iron)
    p.rect(31, base - 46, 1, 46, iron_l)
    p.rect(29, base - 3, 7, 3, iron)
    p.rect(27, base - 52, 11, 2, iron)
    p.rect(28, base - 50, 9, 4, (254, 208, 24))
    p.rect(28, base - 50, 3, 1, (255, 244, 201))
    p.rect(28, base - 46, 9, 1, iron)
    return to_frame(p)


def build():
    for act in range(1, 7):
        L = V.look(act, False)
        frames = [big_house(L, s) for s in (1, 2, 3)]
        frames.append(lamp(L))
        p = fresh()
        V.tree_oak(p, L, 32, FH - 1, 20, 40 + act)
        frames.append(to_frame(p))
        p = fresh()
        V.tree_cypress(p, L, 32, FH - 1, 52, 50 + act)
        frames.append(to_frame(p))
        p = fresh()
        V.tree_eucalyptus(p, L, 32, FH - 1, 50, 60 + act)
        frames.append(to_frame(p))
        sheet = Image.new("RGBA", (FW * len(frames), FH), (0, 0, 0, 0))
        for i, f in enumerate(frames):
            sheet.alpha_composite(f, (i * FW, 0))
        sheet.save(os.path.join(OUT, f"street_{act}.png"))
        if act == 1:
            prev = Image.new("RGBA", sheet.size, (190, 160, 90, 255))
            prev.alpha_composite(sheet)
            prev.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save(os.path.join(V.PREV, "street.png"))
    print("ok")


if __name__ == "__main__":
    build()
