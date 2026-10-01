"""Paisaje que se ve por la ventana del laboratorio (480x270), pintado píxel a píxel.

Mirando al oeste desde Berkeley: la bahía con el Golden Gate al fondo, San
Francisco en el horizonte, los tejados del pueblo, el campanario de la
universidad y un prado delante (las flores animadas las pone el juego).

Una imagen por acto (mes) y por día/noche:  public/assets/view/view_{acto}_{d|n}.png
Uso: python3 tools/art/view.py
"""

import math
import os
import random

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "assets", "view")
PREV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview")
os.makedirs(OUT, exist_ok=True)

W, H = 480, 270
HORIZON = 120  # línea del agua
GROUND = 198  # empieza el prado

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def hx(c):
    return tuple(int(c[i : i + 2], 16) for i in (1, 3, 5))


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


class Painter:
    def __init__(self):
        self.im = Image.new("RGB", (W, H), (0, 0, 0))
        self.px = self.im.load()

    def put(self, x, y, c):
        if 0 <= x < W and 0 <= y < H:
            self.px[int(x), int(y)] = c

    def rect(self, x, y, w, h, c):
        for j in range(int(y), int(y + h)):
            for i in range(int(x), int(x + w)):
                self.put(i, j, c)

    def gradient(self, y0, y1, stops):
        """Degradado vertical con tramado Bayer entre colores vecinos (sin mezclas nuevas)."""
        n = len(stops) - 1
        for y in range(y0, y1):
            t = (y - y0) / max(1, (y1 - y0 - 1)) * n
            k = min(int(t), n - 1)
            f = t - k
            for x in range(W):
                c = stops[k + 1] if f * 16 > BAYER[y % 4][x % 4] + 0.5 else stops[k]
                self.px[x, y] = c


def noise(seed):
    rnd = random.Random(seed)
    table = [rnd.random() for _ in range(512)]

    def n1(x):
        i = int(math.floor(x)) & 255
        f = x - math.floor(x)
        f = f * f * (3 - 2 * f)
        return table[i] * (1 - f) + table[i + 1] * f

    return n1


def noise2(seed):
    """Ruido de valor en 2D (sin direcciones preferidas: nada de rayas)."""
    rnd = random.Random(seed)
    perm = list(range(256))
    rnd.shuffle(perm)
    vals = [rnd.random() for _ in range(256)]

    def h(i, j):
        return vals[perm[(perm[i & 255] + j) & 255]]

    def n(x, y):
        i, j = math.floor(x), math.floor(y)
        fx, fy = x - i, y - j
        fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
        a = h(i, j) * (1 - fx) + h(i + 1, j) * fx
        b = h(i, j + 1) * (1 - fx) + h(i + 1, j + 1) * fx
        return a * (1 - fy) + b * fy

    return n


SNOW = (247, 249, 251)
SNOW_N = (120, 130, 156)


# ------------------------------------------------------------------ paletas por acto

def look(act, night):
    L = {}
    if act in (1, 2):
        L["sky"] = ["#3f7fc8", "#5d9ddc", "#8cc2ec", "#c2e2f6"] if act == 1 else ["#4c84c4", "#6ea4d8", "#9cc8e8", "#d8e6ea"]
        L["far"] = ["#8aa3c4", "#a9bdd6"]
        L["hills"] = ["#b89a58", "#9c7f46", "#d0b46e"]
        L["water"] = ["#3d78b0", "#5a96c8", "#9ccbe8"]
        L["tree"] = ["#284a2c", "#3d6b38", "#5c8f48"]
        L["grass"] = ["#b8963e", "#d2b05a", "#9c7c32"]
        L["roof"] = ["#a85a3a", "#7a4a3a", "#5c6a7a", "#8a6a4a"]
        L["wall"] = ["#efe4cc", "#e0d2b4", "#d8c8a8", "#f4ecd8"]
    if act == 3:
        L["sky"] = ["#7f9cb8", "#9db4ca", "#bccbd8", "#d8e0e6"]
        L["far"] = ["#8a9cae", "#a6b4c2"]
        L["hills"] = ["#5f8a4e", "#4a7240", "#78a25e"]
        L["water"] = ["#4a6f8f", "#6a8eaa", "#a8c0d0"]
        L["tree"] = ["#1f3e26", "#2f5a32", "#46784a"]
        L["grass"] = ["#5f8a44", "#78a256", "#4a7238"]
        L["roof"] = ["#8a4a3a", "#6a3e34", "#4f5c6a", "#7a5a40"]
        L["wall"] = ["#e6dcc6", "#d6c8ac", "#cfc2a6", "#ece2cc"]
        L["xmas"] = True
    if act == 4:
        L["sky"] = ["#8f97a6", "#a8aeba", "#c2c6ce", "#dadde2"]
        L["far"] = ["#c6ccd6", "#dfe3ea"]
        L["hills"] = ["#e8ecf2", "#cdd4de", "#f7f9fb"]
        L["water"] = ["#5e6f80", "#7a8a9a", "#a8b4c0"]
        L["tree"] = ["#2a3c36", "#3c5048", "#f2f5f8"]
        L["grass"] = ["#eef1f5", "#ffffff", "#d6dce4"]
        L["roof"] = ["#f4f6f9", "#e6eaef", "#f4f6f9", "#e6eaef"]
        L["wall"] = ["#cfc6b4", "#c2b8a4", "#b8ae9a", "#d8d0be"]
        L["snow"] = True
    if act == 5:
        L["sky"] = ["#5e6878", "#727c8c", "#8a93a2", "#a2aab6"]
        L["far"] = ["#6f7c8c", "#8592a0"]
        L["hills"] = ["#4f7a46", "#3e663a", "#64905a"]
        L["water"] = ["#46586a", "#5a6c7e", "#7e8e9e"]
        L["tree"] = ["#1e3a24", "#2c5232", "#407044"]
        L["grass"] = ["#4f8a3e", "#68a452", "#3e7230"]
        L["roof"] = ["#7a4636", "#5a3a32", "#4a5664", "#6a5040"]
        L["wall"] = ["#cfc6b2", "#c0b6a0", "#b6ac96", "#d8d0bc"]
        L["rain"] = True
    if act == 6:
        L["sky"] = ["#5a4a8a", "#c25a6a", "#f08a5a", "#fcd28a"]
        L["far"] = ["#7a5a7a", "#9a6a7a"]
        L["hills"] = ["#a07a4a", "#7e5c3a", "#c4964e"]
        L["water"] = ["#6a4a6a", "#c86a5a", "#fcc27a"]
        L["tree"] = ["#3a3a2a", "#5a5232", "#8a7a3e"]
        L["grass"] = ["#c09840", "#dcb85a", "#9c7a30"]
        L["roof"] = ["#9a4a3a", "#6a3a32", "#5a4a5a", "#7a5a40"]
        L["wall"] = ["#f0d2a8", "#e0be90", "#d4b088", "#f6dcb4"]
        L["sunset"] = True
    if night:
        L["sky"] = ["#0b0f20", "#121a32", "#1b2640", "#24324e"]
        L["far"] = ["#1c2438", "#242e46"]
        L["hills"] = [mixh(c, "#0b0f20", 0.65) for c in L["hills"]]
        L["water"] = ["#0e1426", "#18223a", "#2b3a5a"]
        L["tree"] = [mixh(c, "#070a14", 0.6) for c in L["tree"]]
        L["grass"] = [mixh(c, "#0b0f20", 0.6) for c in L["grass"]]
        L["roof"] = [mixh(c, "#0b0f20", 0.6) for c in L["roof"]]
        L["wall"] = [mixh(c, "#0b0f20", 0.65) for c in L["wall"]]
        L["night"] = True
    return {k: ([hx(c) for c in v] if isinstance(v, list) else v) for k, v in L.items()}


def mixh(a, b, t):
    c = mix(hx(a), hx(b), t)
    return "#%02x%02x%02x" % c


# ------------------------------------------------------------------ elementos

def sky(p, L, act):
    p.gradient(0, HORIZON, L["sky"])
    rnd = random.Random(act)
    if L.get("night") and not L.get("rain") and not L.get("snow"):
        for _ in range(140):
            x, y = rnd.randrange(W), rnd.randrange(HORIZON - 20)
            p.put(x, y, (255, 244, 201) if rnd.random() < 0.3 else (150, 160, 200))
        if not L.get("rain") and not L.get("snow"):
            for j in range(-7, 8):
                for i in range(-7, 8):
                    if i * i + j * j <= 49:
                        p.put(380 + i, 34 + j, (255, 244, 201))
                    if (i - 3) ** 2 + (j + 2) ** 2 <= 40:
                        p.put(380 + i, 34 + j, L["sky"][0])
    elif L.get("night"):
        pass
    elif L.get("sunset"):
        for j in range(-12, 13):
            for i in range(-12, 13):
                d = i * i + j * j
                if d <= 144:
                    p.put(346 + i, 98 + j, (255, 226, 150) if d < 100 else (252, 196, 120))
    elif not L.get("rain") and not L.get("snow"):
        for j in range(-8, 9):
            for i in range(-8, 9):
                if i * i + j * j <= 64:
                    p.put(410 + i, 30 + j, (255, 250, 220))


def far_hills(p, L):
    """Colinas de Marin al otro lado de la bahía, con el monte Tamalpais."""
    n = noise(3)
    n2 = noise2(4)
    for x in range(W):
        h = 10 + 9 * n(x * 0.03) + 6 * n(x * 0.09 + 10)
        if 330 < x < 470:
            h += 14 * math.exp(-((x - 420) / 32) ** 2)
        top = int(HORIZON - h * (0.35 if x < 230 else 1))
        for y in range(top, HORIZON):
            c = L["far"][0] if (y - top) < 2 or n2(x * 0.3, y * 0.5) > 0.74 else L["far"][1]
            p.put(x, y, c)
        if L.get("snow") and x > 230:
            for y in range(top, min(HORIZON, top + 3)):
                p.put(x, y, SNOW_N if L.get("night") else SNOW)


def skyline(p, L):
    """San Francisco en la otra orilla, muy lejos, con la pirámide Transamerica."""
    rnd = random.Random(7)
    base = HORIZON
    col = L["far"][1] if not L.get("night") else (36, 46, 70)
    for x in range(30, 128, 3):
        h = rnd.randrange(3, 10)
        p.rect(x, base - h, 3, h, col)
        if L.get("night"):
            for _ in range(2):
                p.put(x + rnd.randrange(3), base - rnd.randrange(1, h + 1), (254, 208, 24))
    for k in range(18):
        w = max(0, 3 - k // 6)
        p.rect(80 - w // 2, base - 9 - k, w + 1, 1, col)


def bay(p, L):
    p.gradient(HORIZON, 142, L["water"])
    rnd = random.Random(11)
    for _ in range(90):
        x, y = rnd.randrange(W), rnd.randrange(HORIZON + 1, 140)
        p.rect(x, y, rnd.randrange(2, 7), 1, L["water"][2])
    if L.get("sunset") and not L.get("night"):
        for y in range(HORIZON + 1, 140):
            for _ in range(3):
                x = 346 + rnd.randrange(-14, 15)
                p.rect(x, y, rnd.randrange(2, 6), 1, (255, 226, 150))


def golden_gate(p, L):
    red = (196, 74, 52) if not L.get("night") else (90, 40, 40)
    dark = (140, 50, 40) if not L.get("night") else (60, 28, 30)
    t1, t2, top, deck = 300, 360, 92, HORIZON - 1
    # tramo lateral y cables principales (curva)
    for x in range(270, 392):
        if x < t1:
            y = top + (deck - top) * ((t1 - x) / 30) ** 0.8 * 0.95
        elif x > t2:
            y = top + (deck - top) * ((x - t2) / 32) ** 0.8 * 0.95
        else:
            u = (x - t1) / (t2 - t1)
            y = top + 2 + (deck - top - 4) * (1 - (2 * u - 1) ** 2)
        p.put(x, int(y), red)
        if (x % 3 == 0) and t1 < x < t2 and int(y) < deck:
            for yy in range(int(y) + 1, deck, 2):
                p.put(x, yy, mix(red, L["sky"][2], 0.55))
        if L.get("night") and x % 6 == 0:
            p.put(x, int(y), (254, 208, 24))
    # tablero
    p.rect(262, deck, 132, 1, dark)
    p.rect(262, deck + 1, 132, 1, red)
    # torres
    for tx in (t1, t2):
        p.rect(tx - 1, top - 3, 3, deck - top + 6, red)
        p.put(tx + 1, top, dark)
        for yy in (top + 3, top + 10, top + 18):
            p.rect(tx - 2, yy, 5, 1, dark)
        if L.get("night"):
            p.put(tx, top - 4, (232, 52, 78))


def berkeley(p, L, act):
    """Ladera con tejados entre árboles bajando hacia la bahía."""
    n = noise(21)
    n2 = noise2(22)
    # suelo de la ladera
    for x in range(W):
        top = int(142 + 6 * n(x * 0.04))
        for y in range(top, GROUND):
            v = n2(x * 0.22, y * 0.35)
            k = 2 if v > 0.82 else (1 if v < 0.25 else 0)
            p.put(x, y, L["hills"][k])
    rnd = random.Random(31)
    rows = [(150, 0.55), (162, 0.75), (176, 1.0)]
    for base, scale in rows:
        x = rnd.randrange(-10, 10)
        while x < W:
            w = int(rnd.randrange(14, 24) * scale)
            if 112 < x < 160 and base > 160:
                x += w + 4
                continue
            house(p, L, x, base, w, int(w * 0.55), rnd)
            x += w + rnd.randrange(3, 16)


def house(p, L, x, base, w, h, rnd):
    wall = rnd.choice(L["wall"])
    roof = rnd.choice(L["roof"])
    shade = mix(wall, (0, 0, 0), 0.18)
    p.rect(x, base - h, w, h, wall)
    p.rect(x + w - 2, base - h, 2, h, shade)
    # tejado a dos aguas
    rh = max(3, w // 3)
    for k in range(rh):
        p.rect(x - 1 + k, base - h - k - 1, w + 2 - 2 * k, 1, roof if k else mix(roof, (0, 0, 0), 0.25))
    if L.get("snow"):
        for k in range(rh):
            snow = SNOW_N if L.get("night") else SNOW
            p.rect(x - 1 + k, base - h - k - 1, w + 2 - 2 * k, 1, snow if k > 0 else mix(snow, (0, 0, 0), 0.12))
    # ventanas
    for i in range(x + 2, x + w - 3, 5):
        lit = L.get("night") and rnd.random() < 0.6
        p.rect(i, base - h + 2, 2, 2, (254, 208, 24) if lit else mix(wall, (40, 50, 70), 0.5))
    if L.get("xmas"):
        cols = [(232, 52, 78), (75, 168, 109), (254, 208, 24), (32, 146, 219)]
        for i in range(x, x + w, 2):
            p.put(i, base - h - 1, cols[(i // 2) % 4])


def campanile(p, L, cx, base):
    """Torre Sather (el campanario de Berkeley): granito claro, reloj y tejado de cobre."""
    night = L.get("night")
    light = (236, 228, 210) if not night else (110, 112, 128)
    mid = (214, 204, 182) if not night else (86, 88, 104)
    dark = (176, 164, 140) if not night else (58, 60, 76)
    ink = (60, 52, 50) if not night else (20, 22, 34)
    copper = (96, 150, 124) if not night else (44, 70, 64)
    copper_d = (66, 112, 92) if not night else (30, 50, 46)
    w, top = 14, base - 118
    # basamento
    p.rect(cx - 9, base - 8, 18, 8, mid)
    p.rect(cx - 9, base - 8, 18, 1, light)
    p.rect(cx + 6, base - 8, 3, 8, dark)
    # fuste con paneles verticales
    p.rect(cx - w // 2, top + 22, w, base - 8 - top - 22, light)
    p.rect(cx + 3, top + 22, 4, base - 8 - top - 22, mid)
    p.rect(cx + 6, top + 22, 1, base - 8 - top - 22, dark)
    for y in range(top + 26, base - 10):
        p.put(cx - 3, y, mid)
        p.put(cx + 1, y, mid)
    # aspilleras
    for y in range(top + 40, base - 20, 14):
        p.rect(cx - 1, y, 1, 3, ink)
    # cornisa y reloj
    p.rect(cx - 8, top + 22, 16, 2, mid)
    p.rect(cx - 8, top + 21, 16, 1, light)
    for j in range(-3, 4):
        for i in range(-3, 4):
            if i * i + j * j <= 10:
                p.put(cx - 1 + i, top + 30 + j, (254, 232, 150) if night else (250, 246, 236))
    p.put(cx - 1, top + 28, ink)
    p.put(cx - 1, top + 29, ink)
    p.put(cx, top + 30, ink)
    # campanario con arcos
    p.rect(cx - 7, top + 8, 14, 13, light)
    p.rect(cx + 4, top + 8, 3, 13, mid)
    for ax in (cx - 5, cx - 1, cx + 3):
        p.rect(ax, top + 11, 2, 8, ink)
        p.put(ax, top + 10, mid)
    p.rect(cx - 8, top + 7, 16, 1, light)
    # tejado piramidal de cobre con linterna y aguja
    for k in range(10):
        wk = 16 - k * 2 + (1 if k % 2 else 0)
        x0 = cx - wk // 2
        p.rect(x0, top + 6 - k, wk, 1, copper)
        p.rect(x0 + wk // 2, top + 6 - k, max(1, wk - wk // 2), 1, copper_d)
    p.rect(cx - 1, top - 6, 2, 3, light)
    p.rect(cx, top - 10, 1, 4, ink)


def tree_oak(p, L, cx, base, r, seed):
    """Roble: copa irregular hecha de varias masas, luz desde arriba a la izquierda."""
    rnd = random.Random(seed)
    n = noise(seed)
    dark, mid, light = L["tree"]
    trunk = (92, 66, 44) if not L.get("night") else (34, 26, 22)
    # tronco y ramas
    p.rect(cx - 1, base - int(r * 0.9), 3, int(r * 0.9), trunk)
    p.put(cx - 2, base - 1, trunk)
    p.put(cx + 2, base - 1, trunk)
    blobs = [(cx + rnd.uniform(-r * 0.6, r * 0.6), base - r * 1.1 + rnd.uniform(-r * 0.4, r * 0.3), r * rnd.uniform(0.45, 0.7)) for _ in range(5)]
    blobs.append((cx, base - r * 1.2, r * 0.7))
    x0, x1 = int(cx - r * 1.6), int(cx + r * 1.6)
    y0, y1 = int(base - r * 2.2), int(base - r * 0.35)
    for y in range(y0, y1):
        for x in range(x0, x1):
            best = None
            for bx, by, br in blobs:
                d = math.hypot(x - bx, (y - by) * 1.1)
                edge = br + 1.6 * (n(x * 0.5 + y * 0.31) - 0.5)
                if d <= edge:
                    v = ((x - bx) * -0.6 + (y - by) * -0.8) / br
                    if best is None or v > best:
                        best = v
            if best is None:
                continue
            t = BAYER[y % 4][x % 4] / 16
            if best > 0.35 + t * 0.25:
                c = light
            elif best < -0.25 + t * 0.2:
                c = dark
            else:
                c = mid
            if rnd.random() < 0.04:
                c = dark
            p.put(x, y, c)
    if L.get("snow"):
        for bx, by, br in blobs:
            for x in range(int(bx - br * 0.7), int(bx + br * 0.7)):
                snow = SNOW_N if L.get("night") else SNOW
                p.put(x, int(by - br * 0.8), snow)
                p.put(x, int(by - br * 0.8) + 1, mix(snow, (0, 0, 0), 0.12))


def tree_cypress(p, L, cx, base, h, seed):
    """Ciprés: llama alta y estrecha, típica de los jardines de Berkeley."""
    n = noise(seed)
    dark, mid, light = L["tree"]
    for y in range(base - h, base):
        t = (y - (base - h)) / h
        half = 1 + int(5 * math.sin(math.pi * min(1, t * 1.1)) ** 0.8 + 1.5 * (n(y * 0.4) - 0.5))
        for x in range(cx - half, cx + half + 1):
            rel = (x - cx) / max(1, half)
            c = light if rel < -0.35 else (dark if rel > 0.4 else mid)
            if BAYER[y % 4][x % 4] > 13:
                c = dark
            p.put(x, y, c)
    if L.get("snow"):
        for y in range(base - h, base - h + 4):
            p.put(cx, y, SNOW_N if L.get("night") else SNOW)


def tree_eucalyptus(p, L, cx, base, h, seed):
    """Eucalipto: tronco claro y alto, copas sueltas arriba."""
    rnd = random.Random(seed)
    trunk = (200, 190, 170) if not L.get("night") else (64, 62, 70)
    p.rect(cx, base - h, 2, h, trunk)
    p.rect(cx + 1, base - h, 1, h, mix(trunk, (0, 0, 0), 0.25))
    for k in range(4):
        bx = cx + rnd.randrange(-8, 9)
        by = base - h + rnd.randrange(-4, 10)
        tree_blob(p, L, bx, by, rnd.randrange(6, 9), seed + k)
        for i in range(min(cx, bx), max(cx, bx)):
            p.put(i, by + 2, trunk)


def tree_blob(p, L, cx, cy, r, seed):
    n = noise(seed)
    dark, mid, light = L["tree"]
    for y in range(cy - r - 1, cy + r + 1):
        for x in range(cx - r - 2, cx + r + 2):
            d = math.hypot(x - cx, (y - cy) * 1.3)
            if d <= r + 1.5 * (n(x * 0.7 + y) - 0.5):
                v = ((x - cx) * -0.6 + (y - cy) * -0.8) / r
                p.put(x, y, light if v > 0.4 else (dark if v < -0.3 else mid))


def ground(p, L):
    p.gradient(GROUND, H, [L["grass"][1], L["grass"][0], L["grass"][2]])
    rnd = random.Random(99)
    for _ in range(900):
        x, y = rnd.randrange(W), rnd.randrange(GROUND, H)
        p.put(x, y, L["grass"][2] if rnd.random() < 0.6 else L["grass"][1])


def paint(act, night):
    L = look(act, night)
    p = Painter()
    sky(p, L, act)
    far_hills(p, L)
    skyline(p, L)
    bay(p, L)
    golden_gate(p, L)
    berkeley(p, L, act)
    # fila de árboles de fondo
    for i, x in enumerate(range(6, W, 38)):
        if 110 < x < 156:
            continue
        kind = i % 3
        if kind == 0:
            tree_oak(p, L, x, 192, 11, 100 + i)
        elif kind == 1:
            tree_cypress(p, L, x + 10, 196, 34, 200 + i)
        else:
            tree_eucalyptus(p, L, x + 4, 196, 40, 300 + i)
    campanile(p, L, 134, 196)
    # árboles cercanos, más grandes, a los lados
    tree_oak(p, L, 26, 214, 24, 501)
    tree_cypress(p, L, 452, 214, 70, 502)
    tree_oak(p, L, 412, 210, 17, 503)
    # matorrales a lo largo de la loma
    for i, x in enumerate(range(60, 380, 46)):
        tree_blob(p, L, x + (i % 2) * 9, 197, 5, 700 + i)
    ground(p, L)
    return p.im


def clouds(mode):
    """Tres nubes en tira (56x20 cada una): base plana, luz arriba a la izquierda."""
    pal = {
        "day": [(214, 232, 246), (247, 250, 252), (255, 255, 255)],
        "gray": [(122, 130, 142), (150, 158, 170), (176, 182, 192)],
        "sunset": [(168, 92, 120), (236, 140, 120), (252, 196, 150)],
        "night": [(22, 30, 54), (32, 42, 70), (44, 56, 88)],
    }[mode]
    sheet = Image.new("RGBA", (56 * 3, 20), (0, 0, 0, 0))
    px = sheet.load()
    for k in range(3):
        rnd = random.Random(k * 13 + 5)
        n2 = noise2(k + 40)
        blobs = [(10 + i * 9 + rnd.randrange(-3, 4), 13 - rnd.randrange(0, 6), rnd.randrange(5, 9)) for i in range(4)]
        for y in range(20):
            for x in range(56):
                best = None
                for bx, by, br in blobs:
                    d = math.hypot(x - bx, (y - by) * 1.25)
                    if d <= br + 1.2 * (n2(x * 0.4, y * 0.4) - 0.5) and y <= 16:
                        v = ((x - bx) * -0.5 + (y - by) * -0.9) / br
                        best = v if best is None else max(best, v)
                if best is None:
                    continue
                t = BAYER[y % 4][x % 4] / 16
                c = pal[2] if best > 0.3 + t * 0.3 else (pal[0] if best < -0.35 + t * 0.2 or y >= 15 else pal[1])
                px[k * 56 + x, y] = c + (255,)
    sheet.save(os.path.join(OUT, f"clouds_{mode}.png"))


def build():
    for mode in ("day", "gray", "sunset", "night"):
        clouds(mode)
    sheet = Image.new("RGB", (W * 2, H * 6))
    for act in range(1, 7):
        for k, night in enumerate((False, True)):
            im = paint(act, night)
            im.save(os.path.join(OUT, f"view_{act}_{'n' if night else 'd'}.png"))
            sheet.paste(im, (k * W, (act - 1) * H))
    sheet.save(os.path.join(PREV, "views.png"))
    print("ok")


if __name__ == "__main__":
    build()
