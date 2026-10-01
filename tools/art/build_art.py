"""Genera el arte propio del juego (todo lo que no viene en los packs CC0).

Uso:  python3 tools/art/build_art.py
Salida: public/assets/*.png  y  tools/art/preview/*.png (vistas ampliadas)

Cada objeto se dibuja píxel a píxel con la paleta de palette.py para que
case con los muebles de Kenney y los personajes de piano_no_renshu.
"""

import math
import os
import random

from PIL import Image

from palette import rgba

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "assets")
PREV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview")
os.makedirs(OUT, exist_ok=True)
os.makedirs(PREV, exist_ok=True)


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.px = self.im.load()

    def put(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[x, y] = rgba(c)

    def rect(self, x, y, w, h, c):
        for j in range(y, y + h):
            for i in range(x, x + w):
                self.put(i, j, c)

    def box(self, x, y, w, h, fill, line="k"):
        self.rect(x, y, w, h, line)
        self.rect(x + 1, y + 1, w - 2, h - 2, fill)

    def hline(self, x, y, w, c):
        self.rect(x, y, w, 1, c)

    def vline(self, x, y, h, c):
        self.rect(x, y, 1, h, c)

    def ascii(self, x, y, rows):
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch != ".":
                    self.put(x + i, y + j, ch)

    def disc(self, cx, cy, r, c):
        for j in range(-r, r + 1):
            for i in range(-r, r + 1):
                if i * i + j * j <= r * r + r * 0.6:
                    self.put(cx + i, cy + j, c)


def strip(frames):
    """Une varios Canvas del mismo tamaño en una tira horizontal."""
    w, h = frames[0].w, frames[0].h
    im = Image.new("RGBA", (w * len(frames), h), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        im.alpha_composite(f.im, (i * w, 0))
    return im


SAVED = []


def save(name, im):
    if isinstance(im, Canvas):
        im = im.im
    im.save(os.path.join(OUT, name + ".png"))
    SAVED.append((name, im))


# ---------------------------------------------------------------- suelo y paredes

def floor_tile():
    c = Canvas(16, 16)
    for j in range(16):
        for i in range(16):
            check = ((i // 8) + (j // 8)) % 2
            c.put(i, j, "t" if check else "T")
    # juntas
    for i in range(16):
        c.put(i, 15, "j")
        c.put(15, i, "j")
        c.put(i, 7, "j")
        c.put(7, i, "j")
    # brillo y motas de vinilo
    random.seed(4)
    for _ in range(7):
        x, y = random.randrange(16), random.randrange(16)
        if x % 8 != 7 and y % 8 != 7:
            c.put(x, y, "j" if random.random() < 0.5 else "l")
    return c


def floor_tile_worn():
    c = floor_tile()
    random.seed(9)
    for _ in range(10):
        x, y = random.randrange(15), random.randrange(15)
        if x % 8 != 7 and y % 8 != 7:
            c.put(x, y, "j")
    return c


def wall_tile():
    c = Canvas(16, 32)
    c.rect(0, 0, 16, 32, "E")
    c.hline(0, 0, 16, "k")
    c.hline(0, 1, 16, "K")
    c.hline(0, 2, 16, "s")
    c.hline(0, 3, 16, "e")
    # papel pintado con raya vertical sutil
    for j in range(4, 21):
        c.put(3, j, "f")
        c.put(11, j, "f")
    # moldura
    c.hline(0, 20, 16, "l")
    c.hline(0, 21, 16, "d")
    # zócalo de madera
    c.rect(0, 22, 16, 8, "b")
    c.hline(0, 22, 16, "B")
    for j in range(23, 30):
        c.put(7, j, "d")
        c.put(15, j, "d")
    c.hline(0, 29, 16, "d")
    c.hline(0, 30, 16, "D")
    c.hline(0, 31, 16, "k")
    return c


def wall_cap_v():
    """Muro lateral visto desde arriba (8 px de ancho)."""
    c = Canvas(8, 16)
    c.rect(0, 0, 8, 16, "K")
    c.vline(0, 0, 16, "k")
    c.vline(7, 0, 16, "k")
    c.vline(1, 0, 16, "s")
    return c


def wall_cap_h():
    c = Canvas(16, 8)
    c.rect(0, 0, 16, 8, "K")
    c.hline(0, 0, 16, "s")
    c.hline(0, 7, 16, "k")
    return c


# ---------------------------------------------------------------- ventana

def window(night, cloudy=False):
    c = Canvas(32, 26)
    c.box(0, 0, 32, 26, "l", "k")
    c.rect(1, 1, 30, 24, "B")
    c.rect(3, 3, 26, 19, "z" if night else "U")
    if cloudy:
        # cielo cubierto: sin estrellas, nubes en capas
        for j in range(3, 22):
            if night:
                col = "Z" if j < 8 else ("v" if j < 14 else "s")
            else:
                col = "H" if j < 8 else ("h" if j < 14 else "G")
            c.hline(3, j, 26, col)
        for x, y, w in [(4, 5, 9), (16, 7, 11), (8, 11, 8)]:
            c.hline(x, y, w, "v" if night else "w")
        for i in range(3, 29):
            top = 16 + int(2.2 * math.sin(i / 3.2)) + (1 if i % 5 == 0 else 0)
            for j in range(top, 22):
                c.put(i, j, "k" if night else "e")
        if night:
            for x, y in [(5, 19), (12, 18), (19, 19), (26, 18)]:
                c.put(x, y, "A")
    elif night:
        # degradado nocturno
        for j in range(3, 22):
            col = "z" if j < 9 else ("Z" if j < 15 else "v")
            c.hline(3, j, 26, col)
        random.seed(2)
        for _ in range(9):
            c.put(random.randrange(3, 29), random.randrange(3, 13), "i" if random.random() < 0.6 else "Y")
        c.put(23, 5, "Y")
        c.put(22, 5, "W")  # luna creciente
        c.put(23, 6, "W")
        c.put(22, 6, "Y")
        # colinas de Berkeley con luces
        for i in range(3, 29):
            top = 16 + int(2.2 * math.sin(i / 3.2)) + (1 if i % 5 == 0 else 0)
            for j in range(top, 22):
                c.put(i, j, "k")
        for x, y in [(5, 19), (8, 20), (12, 18), (16, 20), (19, 19), (24, 20), (26, 18), (14, 21)]:
            c.put(x, y, "y")
    if not night and not cloudy:
        for j in range(3, 22):
            c.hline(3, j, 26, "U" if j < 12 else "u")
        for i in range(3, 29):
            top = 16 + int(2.2 * math.sin(i / 3.2)) + (1 if i % 5 == 0 else 0)
            for j in range(top, 22):
                c.put(i, j, "n" if j < top + 2 else "e")
        c.rect(6, 6, 5, 2, "W")
        c.rect(5, 7, 8, 1, "W")
    # parteluces
    c.vline(15, 3, 19, "B")
    c.vline(16, 3, 19, "d")
    c.hline(3, 12, 26, "B")
    # repisa
    c.rect(0, 22, 32, 4, "b")
    c.hline(0, 22, 32, "l")
    c.hline(0, 25, 32, "D")
    return c


# ---------------------------------------------------------------- terminal CRT

TERM_TEXT = [
    ["yyAy.yA", "", "yAyy.yy", "", "yA."],
    ["yyAy.yA", "", "yAyy.yy", "", "yAyy.Y"],
]


def terminal_alert(frame):
    """Pantalla de alerta: aviso de conexión parpadeando."""
    c = terminal(0)
    c.rect(5, 3, 8, 6, "m")
    if frame == 0:
        c.rect(8, 3, 2, 4, "y")
        c.rect(8, 8, 2, 1, "y")
        c.hline(5, 3, 2, "A")
        c.hline(11, 8, 2, "A")
    else:
        c.rect(8, 3, 2, 4, "A")
        c.rect(8, 8, 2, 1, "A")
    return c


def terminal(frame, off=False):
    c = Canvas(18, 20)
    # carcasa del monitor
    c.box(2, 0, 14, 13, "P")
    c.hline(3, 1, 12, "W")
    c.rect(3, 11, 12, 1, "q")
    # pantalla
    c.box(4, 2, 10, 8, "a" if off else "m")
    if not off:
        for r, line in enumerate(TERM_TEXT[frame]):
            for i, ch in enumerate(line):
                if ch != ".":
                    c.put(5 + i, 3 + r, ch)
        c.put(13, 3, "A")  # reflejo
    # base
    c.rect(6, 13, 6, 1, "k")
    c.rect(7, 13, 4, 1, "q")
    # teclado
    c.box(1, 14, 16, 5, "P")
    for i in range(2, 16, 2):
        c.put(i, 15, "w")
        c.put(i + 1, 16, "w")
    c.hline(2, 17, 14, "q")
    c.hline(5, 16, 7, "W")  # barra espaciadora
    return c


# ---------------------------------------------------------------- minicomputadora

def vax_tape(frame):
    c = Canvas(16, 34)
    c.box(0, 0, 16, 34, "H")
    c.hline(1, 1, 14, "w")
    c.vline(1, 1, 32, "w")
    c.rect(2, 2, 12, 3, "u")
    c.hline(3, 3, 3, "W")  # logo
    # ventana de las cintas
    c.box(2, 6, 12, 18, "s")
    for k, cy in enumerate((11, 19)):
        cx = 8
        c.disc(cx, cy, 4, "g")
        c.disc(cx, cy, 3, "G" if k == 0 else "g")
        c.disc(cx, cy, 1, "h")
        # radios que giran
        ang = frame * math.pi / 4 + k * 0.7
        for spoke in range(3):
            a = ang + spoke * 2 * math.pi / 3
            c.put(cx + round(2.6 * math.cos(a)), cy + round(2.6 * math.sin(a)), "k")
    c.hline(4, 15, 8, "k")  # la cinta
    # panel inferior
    c.rect(2, 25, 12, 1, "h")
    for i, col in enumerate("nyrn"):
        c.put(3 + i * 3, 27, col if (frame + i) % 3 else "s")
    c.rect(2, 29, 12, 3, "G")
    c.hline(2, 30, 12, "g")
    return c


def vax_panel(frame):
    c = Canvas(16, 34)
    c.box(0, 0, 16, 34, "H")
    c.hline(1, 1, 14, "w")
    c.vline(1, 1, 32, "w")
    c.rect(2, 2, 12, 3, "u")
    c.box(2, 6, 12, 11, "k")
    random.seed(frame * 7 + 1)
    for j in range(7, 16, 2):
        for i in range(3, 13, 2):
            r = random.random()
            c.put(i, j, "y" if r < 0.35 else ("r" if r < 0.45 else ("A" if r < 0.6 else "m")))
    # interruptores
    for i in range(3, 13, 2):
        c.put(i, 19, "r" if i < 7 else "u")
        c.put(i, 20, "W")
    c.rect(2, 22, 12, 9, "G")
    for j in range(23, 31, 2):
        c.hline(3, j, 10, "g")
    c.rect(2, 31, 12, 1, "g")
    return c


# ---------------------------------------------------------------- impresora

def printer(frame):
    c = Canvas(20, 18)
    # papel continuo que sale por arriba
    c.rect(4, 0 + frame, 12, 6 - frame, "x")
    for j in range(0 + frame, 6):
        c.put(5, j, "H")
        c.put(14, j, "H")
        if j % 2 == 0:
            c.hline(7, j, 5, "h")
    c.box(1, 5, 18, 9, "p")
    c.hline(2, 6, 16, "P")
    c.rect(3, 7, 14, 2, "k")  # ranura
    c.hline(4, 8, 4 + frame * 3, "G")  # cabezal moviéndose
    c.put(4 + frame * 6, 7, "w")
    c.put(15, 11, "n" if frame == 0 else "N")
    c.put(13, 11, "y")
    c.hline(2, 12, 16, "q")
    # bandeja de papel doblado
    c.box(3, 14, 14, 4, "x", "q")
    c.hline(4, 15, 12, "H")
    return c


# ---------------------------------------------------------------- corcho

def corkboard(stage):
    """stage = número de pistas clavadas (0..5)."""
    c = Canvas(36, 24)
    c.box(0, 0, 36, 24, "O", "D")
    c.rect(1, 1, 34, 1, "d")
    c.rect(1, 22, 34, 1, "d")
    c.vline(1, 1, 22, "d")
    c.vline(34, 1, 22, "d")
    random.seed(12)
    for _ in range(40):
        c.put(random.randrange(3, 33), random.randrange(3, 21), "o" if random.random() < 0.7 else "c")
    notes = [(4, 4, "x"), (13, 3, "x"), (24, 5, "Y"), (6, 13, "x"), (19, 13, "R")]
    pins = []
    for idx, (x, y, col) in enumerate(notes[:stage]):
        c.rect(x + 1, y + 1, 8, 6, "Q")  # sombra
        c.rect(x, y, 8, 6, col)
        c.hline(x + 1, y + 2, 5, "h")
        c.hline(x + 1, y + 4, 4, "h")
        c.put(x + 3, y, "r")
        pins.append((x + 3, y))
    # hilo rojo entre pistas
    for a, b in zip(pins, pins[1:]):
        steps = max(abs(b[0] - a[0]), abs(b[1] - a[1]))
        for s in range(steps + 1):
            t = s / steps
            sag = int(2 * math.sin(math.pi * t))
            c.put(round(a[0] + (b[0] - a[0]) * t), round(a[1] + (b[1] - a[1]) * t) + sag, "r")
    for x, y in pins:
        c.put(x, y, "R")
    if stage == 0:
        c.rect(12, 9, 12, 7, "x")
        c.hline(13, 11, 9, "h")
        c.hline(13, 13, 6, "h")
        c.put(17, 9, "u")
    return c


# ---------------------------------------------------------------- pizarra con carta estelar

def chalkboard():
    c = Canvas(44, 24)
    c.box(0, 0, 44, 22, "S", "D")
    c.rect(1, 1, 42, 1, "b")
    c.vline(1, 1, 20, "b")
    c.vline(42, 1, 20, "b")
    c.hline(1, 20, 42, "b")
    c.rect(2, 2, 40, 18, "S")
    random.seed(5)
    for _ in range(30):
        c.put(random.randrange(3, 41), random.randrange(3, 19), "V")
    # constelación (Orión)
    stars = [(10, 5), (16, 6), (12, 10), (13, 11), (14, 12), (9, 16), (17, 15)]
    lines = [(0, 2), (1, 4), (2, 3), (3, 4), (2, 5), (4, 6)]
    for a, b in lines:
        (x0, y0), (x1, y1) = stars[a], stars[b]
        n = max(abs(x1 - x0), abs(y1 - y0))
        for s in range(n + 1):
            c.put(round(x0 + (x1 - x0) * s / n), round(y0 + (y1 - y0) * s / n), "V")
    for x, y in stars:
        c.put(x, y, "W")
    # tiza: una ecuación y la órbita del cometa Halley
    for i in range(24, 39):
        c.put(i, 5, "w" if i % 3 else "V")
    c.hline(24, 8, 9, "w")
    for t in range(0, 360, 6):
        a = math.radians(t)
        c.put(round(31 + 8 * math.cos(a)), round(14 + 3 * math.sin(a)), "H")
    c.disc(25, 14, 1, "y")
    c.put(37, 12, "W")
    # repisa con tizas
    c.rect(0, 22, 44, 2, "d")
    c.hline(0, 22, 44, "b")
    c.hline(6, 21, 3, "W")
    c.hline(30, 21, 2, "y")
    return c


# ---------------------------------------------------------------- pequeños objetos

def clock():
    """Esfera del reloj; las manecillas las dibuja el juego según la hora."""
    c = Canvas(12, 12)
    c.disc(6, 6, 5, "k")
    c.disc(6, 6, 4, "W")
    c.put(6, 2, "k")
    c.put(10, 6, "k")
    c.put(6, 10, "k")
    c.put(2, 6, "k")
    c.put(5, 5, "w")
    return c


def coffee_machine(on):
    c = Canvas(14, 18)
    # cuerpo
    c.box(1, 0, 12, 17, "g")
    c.hline(2, 1, 10, "G")
    c.vline(2, 1, 15, "G")
    # panel superior con luz
    c.box(3, 2, 8, 4, "k")
    c.put(4, 3, "r" if on else "m")
    c.put(4, 4, "R" if on else "m")
    c.hline(6, 3, 4, "h")
    # boquilla
    c.rect(6, 6, 2, 2, "k")
    # jarra de vidrio
    c.rect(3, 9, 8, 6, "k")
    c.rect(4, 10, 6, 4, "U" if on else "u")
    c.rect(4, 12, 6, 2, "D")
    c.put(5, 10, "W")
    c.vline(11, 10, 3, "k")  # asa
    c.hline(1, 15, 12, "s")
    c.hline(0, 17, 14, "k")
    return c


def desk():
    """Escritorio de oficina metálico, típico de un laboratorio de los 80."""
    c = Canvas(48, 26)
    # tablero (visto en 3/4)
    c.rect(0, 0, 48, 13, "k")
    c.rect(1, 1, 46, 11, "B")
    c.hline(1, 1, 46, "l")
    c.hline(1, 11, 46, "b")
    # canto frontal
    c.rect(0, 13, 48, 3, "k")
    c.rect(1, 13, 46, 2, "d")
    # cajonera izquierda y pata derecha
    c.box(1, 15, 16, 11, "q", "k")
    c.hline(2, 16, 14, "p")
    c.box(2, 17, 14, 4, "q", "Q")
    c.box(2, 21, 14, 4, "q", "Q")
    c.hline(7, 19, 4, "k")
    c.hline(7, 23, 4, "k")
    c.box(41, 15, 6, 11, "q", "k")
    c.vline(42, 16, 9, "p")
    # hueco para las piernas en sombra
    c.rect(17, 15, 24, 9, "s")
    c.hline(17, 15, 24, "k")
    return c


def chair():
    """Silla de oficina vista desde atrás."""
    c = Canvas(16, 20)
    c.box(2, 0, 12, 10, "s", "k")
    c.hline(3, 1, 10, "g")
    c.vline(3, 1, 8, "g")
    c.rect(4, 3, 8, 4, "K")
    c.box(1, 9, 14, 4, "g", "k")
    c.hline(2, 10, 12, "G")
    c.rect(7, 13, 2, 3, "k")
    c.hline(2, 16, 12, "k")
    c.put(2, 17, "k")
    c.put(13, 17, "k")
    c.put(7, 17, "k")
    c.put(8, 17, "k")
    return c


def small_table():
    c = Canvas(26, 18)
    c.rect(0, 0, 26, 10, "k")
    c.rect(1, 1, 24, 8, "B")
    c.hline(1, 1, 24, "l")
    c.rect(0, 10, 26, 2, "k")
    c.hline(1, 10, 24, "d")
    c.rect(1, 12, 2, 6, "k")
    c.rect(23, 12, 2, 6, "k")
    c.vline(2, 12, 5, "D")
    c.vline(24, 12, 5, "D")
    return c


def rug():
    """Alfombra de lana de los 70, con rayas concéntricas."""
    c = Canvas(64, 36)
    rings = ["M", "C", "c", "O", "C", "l", "O", "c", "C"]
    for k, col in enumerate(rings):
        c.rect(k, k, 64 - 2 * k, 36 - 2 * k, col)
    c.rect(len(rings), len(rings), 64 - 2 * len(rings), 36 - 2 * len(rings), "M")
    # trenzado del borde
    for i in range(0, 64, 2):
        c.put(i, 0, "D")
        c.put(i + 1, 35, "D")
    for j in range(0, 36, 2):
        c.put(0, j, "D")
        c.put(63, j + 1, "D")
    # flecos
    return c


def cat(frame):
    """Byte, la gata atigrada del laboratorio, dormida y enroscada."""
    c = Canvas(20, 13)
    rows = [
        "..kk...kk...........",
        ".k14k.k41k..kkkkk...",
        ".k111k111kkk15511kk.",
        "k111111111k125115211k"[:20],
        "k1kk111kk1k11211211k",
        "k11114 1111211211211k".replace(" ", "1")[:20],
        ".k3333331k111111111k",
        "..k33333k1112111211k",
        ".k333kk111111111111k",
        ".kkkk1211211211113 3k".replace(" ", "3")[:20],
        "....kkkkkkkkkkkkkkk.",
    ]
    rows[5] = "k111141111211211211k"[:19] + "k"
    rows[3] = "k111111111k12511521k"
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch != ".":
                c.put(x, y + 2, ch)
    if frame:
        # respira: el lomo sube un píxel
        lomo = c.im.crop((10, 2, 20, 12))
        c.rect(10, 1, 10, 11, ".")
        c.im.alpha_composite(lomo, (10, 1))
        c.put(10, 11, "k")
        c.put(19, 11, "k")
    return c


def tape_box(variant=0):
    """Caja de cartón con cintas de respaldo y etiqueta."""
    c = Canvas(18, 17)
    # cara superior abierta (interior oscuro) con dos cintas
    c.rect(1, 4, 16, 5, "k")
    c.rect(2, 5, 14, 3, "o")
    c.hline(2, 5, 14, "D")
    for cx in (6, 12):
        c.disc(cx, 5, 2, "k")
        c.disc(cx, 5, 1, "h" if variant == 0 else "G")
        c.put(cx, 5, "k")
    # solapas abiertas
    c.ascii(0, 0, [
        "kk..............kk",
        "kOk............kOk",
        "kcOk..........kOck",
        ".kcOk........kOck.",
        "..kkk........kkk..",
    ])
    # cara frontal
    c.rect(0, 8, 18, 9, "k")
    c.rect(1, 9, 16, 7, "O")
    c.hline(1, 9, 16, "c")
    c.hline(1, 15, 16, "o")
    c.vline(16, 9, 7, "o")
    # cinta adhesiva y etiqueta
    c.vline(8, 9, 7, "c")
    c.vline(9, 9, 7, "l")
    c.rect(2, 11, 5, 3, "x")
    c.hline(3, 12, 3, "h" if variant == 0 else "r")
    c.rect(11, 11, 4, 3, "x")
    c.hline(12, 12, 2, "s")
    return c


def satellite(frame):
    """Satélite de comunicaciones con paneles solares (mapa de red)."""
    c = Canvas(21, 13)
    # paneles
    for x0 in (0, 13):
        c.rect(x0, 3, 8, 7, "k")
        c.rect(x0 + 1, 4, 6, 5, "u")
        for i in range(x0 + 2, x0 + 7, 2):
            c.vline(i, 4, 5, "v")
        c.hline(x0 + 1, 6, 6, "v")
        c.put(x0 + 1, 4, "U")
    # brazos
    c.hline(8, 6, 5, "h")
    # cuerpo dorado
    c.rect(8, 2, 5, 9, "k")
    c.rect(9, 3, 3, 7, "y")
    c.vline(9, 3, 7, "Y")
    c.vline(11, 3, 7, "A")
    # antena parabólica
    c.ascii(8, 9, ["kWWWk", ".kWk.", "..k.."])
    c.vline(10, 0, 2, "k")
    c.put(10, 0, "r" if frame else "R")
    return c


def telescope():
    c = Canvas(18, 30)
    # tubo inclinado hacia la ventana (arriba a la izquierda)
    for t in range(13):
        x, y = 2 + t, 2 + int(t * 0.75)
        c.put(x, y, "k")
        c.put(x, y + 1, "y" if t < 11 else "A")
        c.put(x, y + 2, "A")
        c.put(x, y + 3, "k")
    c.rect(1, 1, 3, 5, "k")
    c.rect(2, 2, 1, 3, "U")  # lente
    c.rect(14, 11, 3, 3, "k")
    c.put(15, 12, "y")
    # montura y trípode de madera
    c.rect(8, 9, 3, 3, "k")
    c.put(9, 10, "G")
    for t in range(16):
        c.put(9 - t // 3, 12 + t, "D")
        c.put(9, 12 + t, "d")
        c.put(9 + t // 3, 12 + t, "D")
    c.hline(4, 29, 11, "k")
    return c


def water_cooler(frame):
    c = Canvas(12, 26)
    # garrafa azul
    c.box(2, 0, 8, 10, "U", "k")
    c.rect(3, 3, 6, 6, "u")
    c.put(4, 4, "W")
    if frame:
        c.put(6, 7, "W")
        c.put(5, 5, "W")
    else:
        c.put(7, 6, "W")
    c.rect(4, 10, 4, 1, "k")
    # cuerpo
    c.box(0, 11, 12, 15, "w", "k")
    c.hline(1, 12, 10, "W")
    c.rect(2, 14, 8, 4, "s")
    c.put(3, 15, "r")
    c.put(8, 15, "u")
    c.hline(1, 24, 10, "H")
    return c


def coat_rack():
    """Perchero de madera con la gabardina de Sam y su bufanda roja."""
    c = Canvas(16, 34)
    # poste y base
    c.rect(7, 2, 2, 30, "k")
    c.vline(7, 3, 28, "b")
    c.vline(8, 3, 28, "d")
    c.ascii(3, 30, ["kkkkkkkkkk", "kDddbbddDk", ".kk....kk."])
    # remate y ganchos
    c.ascii(5, 0, ["..kk..", ".kbdk.", "kkbdkk", "k.kk.k"])
    # gabardina colgada
    c.ascii(2, 4, [
        "....kkkkk...",
        "...kQqqqQk..",
        "..kQqqqqqQk.",
        "..kqqQqqqqk.",
        ".kqqqQqqqqqk",
        ".kqqqQqqqQqk",
        ".kqqqQqqqQqk",
        ".kQqqQqqqQqk",
        ".kQqqQqqqQQk",
        ".kQqqQqqqQQk",
        "..kqqQqqqQk.",
        "..kQqQqqQQk.",
        "...kkkkkkk..",
    ])
    # bufanda roja con rayas y flecos
    c.ascii(5, 5, [
        "kkkkkk",
        "krRrrk",
        ".krRrk",
        ".krrk.",
        ".krRk.",
        ".krrk.",
        ".kRrk.",
        ".krrk.",
        ".kkkk.",
        ".r.r..",
    ])
    return c


def fridge():
    """Nevera pequeña color crema de los 80, con imanes."""
    c = Canvas(16, 30)
    c.box(0, 0, 16, 29, "P", "k")
    c.hline(1, 1, 14, "W")
    c.vline(1, 1, 27, "W")
    c.vline(14, 1, 27, "q")
    c.hline(1, 10, 14, "k")  # separación del congelador
    c.hline(1, 11, 14, "q")
    c.rect(12, 4, 2, 4, "h")  # tiradores
    c.rect(12, 14, 2, 6, "h")
    c.vline(12, 4, 4, "G")
    c.vline(12, 14, 6, "G")
    # imanes y una nota
    c.put(4, 4, "r")
    c.put(6, 5, "u")
    c.rect(3, 14, 5, 6, "x")
    c.hline(4, 16, 3, "h")
    c.hline(4, 18, 2, "h")
    c.put(5, 14, "y")
    c.hline(0, 29, 16, "k")
    c.hline(1, 28, 14, "Q")
    return c


def bicycle():
    c = Canvas(34, 20)
    def wheel(cx, cy):
        for t in range(0, 360, 8):
            a = math.radians(t)
            c.put(round(cx + 6 * math.cos(a)), round(cy + 6 * math.sin(a)), "k")
            c.put(round(cx + 5 * math.cos(a)), round(cy + 5 * math.sin(a)), "s")
        c.put(cx, cy, "H")
        for t in (0, 60, 120):
            a = math.radians(t)
            for r in range(1, 5):
                c.put(round(cx + r * math.cos(a)), round(cy + r * math.sin(a)), "h")
                c.put(round(cx - r * math.cos(a)), round(cy - r * math.sin(a)), "h")
    wheel(7, 13)
    wheel(26, 13)
    # cuadro rojo
    for t in range(12):
        c.put(7 + t, 13 - t // 2, "r")
        c.put(14 + t, 8, "r") if t < 9 else None
        c.put(19 + t // 2, 8 + t // 2, "r") if t < 10 else None
    for t in range(6):
        c.put(14, 8 + t // 1, "r") if t < 6 else None
    c.hline(11, 5, 6, "k")  # sillín
    c.hline(22, 4, 4, "k")  # manillar
    c.vline(23, 4, 5, "g")
    return c


def radio(frame):
    c = Canvas(16, 10)
    c.box(0, 1, 16, 9, "g", "k")
    c.hline(4, 0, 8, "k")  # asa
    c.hline(1, 2, 14, "G")
    for i, cx in enumerate((4, 11)):
        r = 2 + (1 if frame and i == 0 else 0)
        c.disc(cx, 5, 2, "k")
        c.disc(cx, 5, 1, "s" if not frame else "K")
    c.rect(7, 3, 2, 3, "k")
    c.put(7, 4, "y" if frame else "m")
    c.hline(6, 7, 4, "h")
    return c


def postit():
    c = Canvas(4, 4)
    c.rect(0, 0, 4, 4, "y")
    c.hline(0, 3, 4, "A")
    c.put(1, 1, "m")
    c.put(2, 1, "m")
    return c


def emotes():
    """Burbujas de emoción sobre los personajes: ! ? ... y nota musical."""
    frames = []
    icons = {
        "exclaim": ["..y..", "..y..", "..y..", ".....", "..y.."],
        "question": [".yyy.", "...y.", "..yy.", ".....", "..y.."],
        "dots": [".....", ".....", "y.y.y", ".....", "....."],
        "note": ["..yy.", "..y.y", "..y..", "yyy..", "yy..."],
        "heart": [".r.r.", "rrrrr", "rrrrr", ".rrr.", "..r.."],
    }
    for name, icon in icons.items():
        c = Canvas(11, 11)
        c.rect(1, 0, 9, 9, "k")
        c.rect(0, 1, 11, 7, "k")
        c.rect(1, 1, 9, 7, "W")
        c.ascii(3, 2, [row.replace("y", "k") if name != "heart" else row for row in icon][:5])
        # piquito
        c.rect(4, 9, 3, 1, "k")
        c.put(5, 10, "k")
        c.put(5, 9, "W")
        frames.append(c)
    return strip(frames)


def paper_item():
    """Hoja de papel continuo doblada: lo que Sam recoge de la impresora."""
    c = Canvas(10, 9)
    c.ascii(0, 0, [
        "kkkkkkkkk.",
        "kxhxxxxhxk",
        "kxxhhhxxxk",
        "kxhxxxxhxk",
        "kxxhhxxxxk",
        "kxhxxxxhxk",
        "kxxxhhhxxk",
        "kkkkkkkkkk",
        ".QQQQQQQQ.",
    ])
    return c


def folder_item():
    """Carpeta de expediente del archivador."""
    c = Canvas(10, 9)
    c.ascii(0, 0, [
        ".kkkk.....",
        "kOOOOkkkkk",
        "kOOOOOOOOk",
        "kOxxxxxxOk",
        "kOOOOOOOOk",
        "kOrrOOOOOk",
        "kOOOOOOOOk",
        "kkkkkkkkkk",
        ".QQQQQQQQ.",
    ])
    return c


def desk_lamp(on):
    c = Canvas(10, 14)
    c.ascii(0, 0, [
        "...kkkk...",
        "..kgggGk..",
        ".kgggggGk.",
        ".kkkkkkkk.",
        "...y" + ("Y" if on else "k") + "y.....",
        "....k.....",
        "....k.....",
        "....k.....",
        "...k......",
        "...k......",
        "...k......",
        "..kgk.....",
        ".kgggk....",
        ".kkkkk....",
    ])
    return c


def mug():
    c = Canvas(8, 7)
    c.ascii(0, 0, [
        ".kkkkk..",
        "kWWWWWk.",
        "kWrrWWkk",
        "kWWWWWk.k",
        "kHWWWHkk",
        ".kHHHk..",
        "..kkk...",
    ])
    return c


def filing_cabinet():
    c = Canvas(14, 26)
    c.box(0, 0, 14, 26, "q")
    c.hline(1, 1, 12, "p")
    for k in range(3):
        y = 2 + k * 8
        c.box(1, y, 12, 7, "p", "Q")
        c.hline(2, y + 1, 10, "P")
        c.rect(5, y + 3, 4, 1, "k")
        c.put(6, y + 2, "x")
        c.put(7, y + 2, "x")
    c.hline(0, 25, 14, "k")
    return c


def poster_halley():
    """Póster del cometa Halley, que pasó cerca del Sol en febrero de 1986."""
    c = Canvas(16, 20)
    c.box(0, 0, 16, 20, "z", "k")
    random.seed(8)
    for _ in range(10):
        c.put(random.randrange(1, 15), random.randrange(1, 13), "i")
    # cola del cometa
    for t in range(10):
        c.put(11 - t, 4 + t // 2, "U" if t < 4 else "v")
        c.put(11 - t, 5 + t // 2, "u" if t < 6 else "v")
    c.disc(12, 4, 1, "W")
    c.rect(1, 14, 14, 5, "y")
    c.hline(2, 15, 12, "m")
    c.hline(3, 17, 8, "m")
    return c


def calendar():
    c = Canvas(12, 16)
    c.box(0, 0, 12, 16, "x", "k")
    c.rect(1, 1, 10, 4, "r")
    c.hline(2, 2, 7, "W")  # AGOSTO 1986
    for j in range(6, 15, 2):
        for i in range(2, 11, 2):
            c.put(i, j, "h")
    c.put(8, 10, "r")  # una fecha marcada
    c.put(9, 10, "r")
    return c


def door(label):
    c = Canvas(18, 34)
    c.box(0, 0, 18, 34, "d", "k")
    c.rect(2, 2, 14, 32, "b")
    c.vline(2, 2, 32, "B")
    # ventanilla de vidrio esmerilado
    c.box(4, 5, 10, 9, "F", "D")
    c.hline(5, 6, 8, "W")
    if label:
        c.hline(6, 9, 6, "k")
        c.hline(7, 11, 4, "s")
    c.rect(4, 18, 10, 6, "B")
    c.rect(4, 26, 10, 6, "B")
    c.put(13, 21, "y")
    c.put(13, 22, "D")
    return c


def phone():
    c = Canvas(10, 8)
    c.ascii(0, 0, [
        ".kkkkkkkk.",
        "kCCkkkkCCk",
        "kkMMMMMMkk",
        ".kMCWWCMk.",
        ".kMWkkWMk.",
        ".kMCWWCMk.",
        ".kMMMMMMk.",
        "..kkkkkk..",
    ])
    return c


def papers():
    c = Canvas(12, 8)
    c.rect(1, 2, 10, 6, "h")
    c.rect(0, 1, 10, 6, "x")
    c.hline(1, 3, 7, "h")
    c.hline(1, 5, 5, "h")
    c.rect(4, 0, 8, 5, "W")
    c.hline(5, 2, 5, "H")
    return c


def trash():
    c = Canvas(10, 12)
    c.box(1, 2, 8, 10, "G", "k")
    c.hline(0, 2, 10, "k")
    c.hline(2, 3, 6, "h")
    for j in range(5, 11, 2):
        c.hline(2, j, 6, "g")
    c.rect(3, 0, 3, 2, "x")
    return c


def interact_marker(frame):
    c = Canvas(7, 8)
    y = 1 if frame else 0
    c.ascii(0, y, [
        "..kkk..",
        ".kyyyk.",
        ".kyYyk.",
        "..kyk..",
        "...k...",
    ])
    return c


# ---------------------------------------------------------------- UI

def dialog_frame():
    """Marco 9-slice para cajas de diálogo (24x24, bordes de 8)."""
    c = Canvas(24, 24)
    c.rect(0, 0, 24, 24, "k")
    c.rect(1, 1, 22, 22, "s")
    c.rect(2, 2, 20, 20, "K")
    c.rect(3, 3, 18, 18, "z")
    for p in [(1, 1), (22, 1), (1, 22), (22, 22)]:
        c.put(p[0], p[1], "y")
    c.hline(3, 3, 18, "Z")
    return c


def network_icons():
    """Iconos del mapa de red: nodo, nodo alerta, nodo del intruso."""
    frames = []
    for kind in ("node", "lab", "alert", "intruder", "ok"):
        c = Canvas(11, 11)
        col = {"node": "U", "lab": "y", "alert": "r", "intruder": "R", "ok": "N"}[kind]
        dark = {"node": "u", "lab": "A", "alert": "m", "intruder": "r", "ok": "n"}[kind]
        c.disc(5, 5, 4, "k")
        c.disc(5, 5, 3, dark)
        c.disc(5, 5, 2, col)
        c.put(4, 4, "W")
        if kind == "intruder":
            c.rect(3, 5, 5, 1, "k")
        if kind == "ok":
            c.put(3, 5, "k")
            c.put(4, 6, "k")
            c.put(5, 5, "k")
            c.put(6, 4, "k")
            c.put(7, 3, "k")
        frames.append(c)
    return strip(frames)


# ---------------------------------------------------------------- build

def main():
    save("floor", strip([floor_tile(), floor_tile_worn()]))
    save("wall", wall_tile())
    save("wall_cap_v", wall_cap_v())
    save("wall_cap_h", wall_cap_h())
    save("window", strip([window(False), window(True), window(False, True), window(True, True)]))
    save("terminal", strip([terminal(0), terminal(1), terminal(0, off=True), terminal_alert(0), terminal_alert(1)]))
    save("vax_tape", strip([vax_tape(i) for i in range(6)]))
    save("vax_panel", strip([vax_panel(i) for i in range(4)]))
    save("printer", strip([printer(0), printer(1)]))
    save("corkboard", strip([corkboard(i) for i in range(6)]))
    save("chalkboard", chalkboard())
    save("clock", clock())
    save("coffee", strip([coffee_machine(False), coffee_machine(True)]))
    save("mug", mug())
    save("desk", desk())
    save("rug", rug())
    save("cat", strip([cat(0), cat(1)]))
    save("telescope", telescope())
    save("cooler", strip([water_cooler(0), water_cooler(1)]))
    save("coatrack", coat_rack())
    save("fridge", fridge())
    save("bicycle", bicycle())
    save("radio", strip([radio(0), radio(1)]))
    save("tapebox", strip([tape_box(0), tape_box(1)]))
    save("satellite", strip([satellite(0), satellite(1)]))
    save("postit", postit())
    save("emotes", emotes())
    save("paper_item", paper_item())
    save("folder_item", folder_item())
    save("chair", chair())
    save("table", small_table())
    save("lamp", strip([desk_lamp(False), desk_lamp(True)]))
    save("filing", filing_cabinet())
    save("poster", poster_halley())
    save("calendar", calendar())
    save("door", strip([door(False), door(True)]))
    save("phone", phone())
    save("papers", papers())
    save("trash", trash())
    save("marker", strip([interact_marker(0), interact_marker(1)]))
    save("dialog", dialog_frame())
    save("net_icons", network_icons())

    # hoja de vista previa ampliada x4
    pad = 6
    width = 900
    x = y = pad
    row_h = 0
    placed = []
    for name, im in SAVED:
        w, h = im.width * 4, im.height * 4
        if x + w > width:
            x = pad
            y += row_h + pad
            row_h = 0
        placed.append((im, x, y))
        x += w + pad
        row_h = max(row_h, h)
    sheet = Image.new("RGBA", (width, y + row_h + pad), (40, 38, 58, 255))
    for im, px, py in placed:
        sheet.alpha_composite(im.resize((im.width * 4, im.height * 4), Image.NEAREST), (px, py))
    sheet.save(os.path.join(PREV, "props_sheet.png"))
    print("ok", len(SAVED), "assets")


if __name__ == "__main__":
    main()
