"""Personajes propios del juego: Sam, Ruth y Kessler.

Cada personaje: 16x24 px, 4 direcciones (abajo, izquierda, arriba, derecha)
x 4 cuadros (quieto, paso A, quieto, paso B). La derecha es el espejo de la izquierda.

Uso: python3 tools/art/characters.py  ->  public/assets/characters.png
"""

import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "assets")
PREV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview")

COMMON = {
    "k": "#1c1830",
    "e": "#1c1830",
    "W": "#ffffff",
    "s": "#f6d0a8",
    "S": "#dca27e",
    "r": "#b4504a",
    "R": "#f2a09a",
    "L": "#bfe6ff",
}

CHARS = {
    "sam": {
        "H": "#8a6446", "h": "#5c402c", "d": "#3a281c", "g": "#3e3a5c",
        "i": "#c09060", "j": "#9a6e42", "J": "#6e4c2c", "w": "#f4f0e2",
        "p": "#3d5a8a", "P": "#2b4266", "b": "#4a3426", "B": "#7a5a40",
    },
    "ruth": {
        "H": "#f08a5a", "h": "#cc4a2e", "d": "#8e2a1e", "o": "#fed018",
        "i": "#79b894", "t": "#4b8a6d", "T": "#2f604a",
        "p": "#4a4a5c", "P": "#34344a", "b": "#2e2a48", "B": "#5a5678",
    },
    "kessler": {
        "s": "#f0c2a2", "S": "#d29a7c",
        "H": "#d8d8de", "h": "#a6a6b0", "d": "#6a6a76", "m": "#8a8a96",
        "w": "#f4f4ec", "v": "#c8c8be", "r": "#c83a3a", "R": "#ee6a6a", "J": "#6e4c2c",
        "p": "#5c5c66", "P": "#45454f", "b": "#1c1830", "B": "#3e3a5c",
    },
}

# Cada vista: 13 filas de cabeza + 6 de cuerpo (las piernas van aparte).
VIEWS = {
    "sam": {
        "down": [
            "......kkk.kk....",
            "....kkHhkkhk....",
            "...khHHhhhhhk...",
            "..khHhhhhhdhhk..",
            ".khHhhhhhdhhhhk.",
            ".khhhhhdhhhhdhk.",
            ".kdhhdhhhhdhhdk.",
            ".kdsssshdssssdk.",
            ".kgggggsSgggggk.",
            ".kgWeLgssgWeLgk.",
            ".kSggggssggggSk.",
            "..kRsssrrsssRk..",
            "...kkSSSSSSkk...",
            "...kkJjwwjJkk...",
            "..kjiJwWWwJijk..",
            ".kjikjJwwJjkijk.",
            ".kjJkjjJwJjkJjk.",
            ".ksSkJjjjjJkSsk.",
            "..kkkPppppPkkk..",
        ],
        "up": [
            "......kkk.kk....",
            "....kkHhkkhk....",
            "...khHHhhhhhk...",
            "..khHhhhhhdhhk..",
            ".khHhhhhhdhhhhk.",
            ".khhhhhdhhhhdhk.",
            ".khdhhhhhdhhhhk.",
            ".khhhdhhhhhhdhk.",
            ".kghhhhdhhhhhgk.",
            ".kshdhhhhhdhhsk.",
            ".kSdhhhhhhhhdSk.",
            "..kSdhhhhhhdSk..",
            "...kkSSSSSSkk...",
            "...kkJjjjjJkk...",
            "..kjijjjjjjijk..",
            ".kjikjjjjjjkijk.",
            ".kjJkjjJJjjkJjk.",
            ".ksSkJjjjjJkSsk.",
            "..kkkPppppPkkk..",
        ],
        "left": [
            ".........kkk.k..",
            "......kkkHhkhk..",
            "....kkhHHhhhhhk.",
            "...khHhhhhhdhhhk",
            "..khHhhhhdhhhhhk",
            "..kdhhhhhhhhdhhk",
            ".kdhhdhhhhdhhhhk",
            ".kdsssdhhhhhdhhk",
            ".kggggsShhhdhhk.",
            "ksgeWggggShdhhk.",
            ".kgggssssSShhhk.",
            "..kssrsssShdhk..",
            "...kkSSSSkhhk...",
            "....kkwJjjjkk...",
            "...kwwjijjjjk...",
            "...kwjjkijjjk...",
            "...kwJjkjjJjk...",
            "...kJjksSkjJk...",
            "....kkPpppkk....",
        ],
    },
    "ruth": {
        "down": [
            "....kkk..kkk....",
            "..kkHhhkkhHhkk..",
            ".khHHhhhhhhHHhk.",
            "khHhhdhhhhdhhHhk",
            "khhhdhhhhhhdhhhk",
            "khdhhhhhhhhhhdhk",
            "khhhdhhhhhhdhhhk",
            "khhdsssssssssdhk",
            "khdssssssssssdhk",
            "khdseWssssWesdhk",
            "khdRsessssesRdhk",
            "khhdSssrrssSdhhk",
            "kHhdoSSSSSSodhHk",
            ".khhkkTttTkkhhk.",
            "..kttiTTTTittk..",
            ".ktikttiittktik.",
            ".kTtktTttTtktTk.",
            ".ksSkTtttTtkSsk.",
            "..kkkPppppPkkk..",
        ],
        "up": [
            "....kkk..kkk....",
            "..kkHhhkkhHhkk..",
            ".khHHhhhhhhHHhk.",
            "khHhhdhhhhdhhHhk",
            "khhhdhhHhhhdhhhk",
            "khdhhhhHHhhhhdhk",
            "khhhdhhhhhhdhhhk",
            "khHhhhdhhdhhhHhk",
            "khhdhhhhhhhhdhhk",
            "khhhhdhHhdhhhhhk",
            "khdhhhhhhhhhhdhk",
            "khhHdhhhhhhdHhhk",
            "kHhdhhhdhhhhdhHk",
            ".khhdhhhhhhdhhk.",
            "..khhhdhhdhhhk..",
            ".ktikhhhhhhktik.",
            ".kTtktTttTtktTk.",
            ".ksSkTtttTtkSsk.",
            "..kkkPppppPkkk..",
        ],
        "left": [
            ".....kkk..kkk...",
            "...kkHhhkkhHhk..",
            "..khHHhhhhhhHhk.",
            ".khHhhdhhhhdhhHk",
            ".khhdhhhhhhhdhhk",
            "khdhhhhhhhhhhdhk",
            "khhhdhhhhhdhhhhk",
            "khdssssdhhhhdhhk",
            "kdsssssshhdhhhhk",
            "kseWsssshhhhdhhk",
            "ksessRsSdhhhhHhk",
            ".ksrsssSohhdhhhk",
            "..kkSSkhhhhdhhk.",
            "....kkTttkhhdk..",
            "...ktittTkhhk...",
            "...ktiktttk.....",
            "...kTtkTttk.....",
            "...kTksSkTk.....",
            "....kkPpppkk....",
        ],
    },
    "kessler": {
        "down": [
            "................",
            ".....kkkkkk.....",
            "...kkssWWsskk...",
            "..kssssWsssssk..",
            ".kHssssssssssHk.",
            ".khHssssssssHhk.",
            ".khhsssssssshhk.",
            ".khddddssddddhk.",
            ".khsWesssseWshk.",
            ".kSsseSssSessSk.",
            ".kSsmmmmmmmmsSk.",
            "..kSmmsrrsmmSk..",
            "...kkSSSSSSkk...",
            "...kkwvrrvwkk...",
            "..kwJwwrrwwJwk..",
            ".kwwkJwRrwJkwwk.",
            ".kvwkJwrrwJkwvk.",
            ".ksSkJvwwvJkSsk.",
            "..kkkPppppPkkk..",
        ],
        "up": [
            "................",
            ".....kkkkkk.....",
            "...kkssWWsskk...",
            "..ksssWssssssk..",
            ".kHssssssssssHk.",
            ".khHssssssssHhk.",
            ".khhHhhhhhhHhhk.",
            ".khhhhhhhhhhhhk.",
            ".kshhhhhhhhhhsk.",
            ".kShhhhhhhhhhSk.",
            ".kShhhhhhhhhhSk.",
            "..kShhhhhhhhSk..",
            "...kkSSSSSSkk...",
            "...kkwvwwvwkk...",
            "..kwJwwwwwwJwk..",
            ".kwwkwJwwJwkwwk.",
            ".kvwkwwJJwwkwvk.",
            ".ksSkwvJJvwkSsk.",
            "..kkkPppppPkkk..",
        ],
        "left": [
            "................",
            "......kkkkkk....",
            "....kkssWWskk...",
            "...ksssWWsssssk.",
            "..kssssssssssHk.",
            "..kssssssssssHhk",
            ".ksssssssssHhhhk",
            ".kdddsssssShhdhk",
            "ksseWssssShhhhk.",
            "kSsssssSSsShhhk.",
            "kmmmmssSSShdhk..",
            ".kmmsrsSShhk....",
            "..kkSSSSkkk.....",
            "....kkwwwvkk....",
            "...krwJwwwwk....",
            "...kRwJkwwwk....",
            "...krwJkwwvk....",
            "...kvwksSkwk....",
            "....kkPppPkk....",
        ],
    },
}

LEGS_FRONT = {
    "stand": [
        "....kpPppPpk....",
        "....kppkkppk....",
        "....kpPkkPpk....",
        "....kBbkkBbk....",
        "....kkk..kkk....",
    ],
    "a": [
        "....kpPppPpk....",
        "....kppkkppk....",
        "....kpPkkBbk....",
        "....kBbk.kkk....",
        "....kkk.........",
    ],
    "b": [
        "....kpPppPpk....",
        "....kppkkppk....",
        "....kBbkkPpk....",
        "....kkk.kBbk....",
        ".........kkk....",
    ],
}

LEGS_SIDE = {
    "stand": [
        ".....kppppk.....",
        ".....kpPppk.....",
        ".....kpPppk.....",
        "....kBbbbbk.....",
        "....kkkkkkk.....",
    ],
    "a": [
        ".....kppppk.....",
        "....kppkkPPk....",
        "...kppk..kPPk...",
        "..kBbbk...kbbk..",
        "..kkkk.....kk...",
    ],
    "b": [
        ".....kppppk.....",
        "....kPPkkppk....",
        "...kPPk..kppk...",
        "..kbbbk...kBbk..",
        "..kkkk.....kk...",
    ],
}


def hex2rgba(h):
    return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255)


def autoshade(rows, style):
    """Sombreado del pelo con luz desde arriba a la izquierda: banda de brillo
    arriba, sombra en el borde derecho e inferior. Da mechones limpios en vez
    de puntos sueltos."""
    g = [list(r.replace("H", "h").replace("d", "h")) for r in rows]
    h, w = len(g), 16
    hair = lambda x, y: 0 <= x < w and 0 <= y < h and g[y][x] == "h"
    edge = lambda x, y: not (0 <= x < w and 0 <= y < h) or g[y][x] in "k."
    out = [row[:] for row in g]
    for y in range(h):
        for x in range(w):
            if g[y][x] != "h":
                continue
            if not hair(x, y - 1) and x <= 10:
                out[y][x] = "H"
            elif (not hair(x, y - 2) and 4 <= x <= 7 and hair(x, y - 1)):
                out[y][x] = "H"
            elif edge(x + 1, y) or edge(x, y + 1):
                out[y][x] = "d"
    # textura: mechones (Sam) o rizos (Ruth)
    for y in range(h):
        for x in range(w):
            if out[y][x] != "h":
                continue
            if style == "strands":
                if x in (4, 8, 11) and hair(x, y - 2) and y >= 3 and (y + x) % 5 < 2:
                    out[y][x] = "d"
            elif style == "curls":
                k = (x * 73 + y * 151) % 13
                if k == 0 and out[y][x + 1 if x + 1 < w else x] == "h":
                    out[y][x] = "H"
                    if x + 1 < w and out[y][x + 1] == "h":
                        out[y][x + 1] = "H"
                elif k in (5, 9) and y >= 3 and (x + y) % 2 == 0:
                    out[y][x] = "d"
    return ["".join(r) for r in out]


# Paso de frente/espaldas de Kessler al estilo del pack: el cuerpo baja un
# píxel y un pie se adelanta (zapato entero) mientras el otro queda atrás.
KESSLER_STEP = {
    "a": [
        "....kpPppPpk....",
        "....kpPkkPpk....",
        "...kBbbkkPpk....",
        "...kkkk..kk.....",
    ],
    "b": [
        "....kpPppPpk....",
        "....kpPkkPpk....",
        "....kpPkkbbBk...",
        ".....kk..kkkk...",
    ],
}


def frame(name, view, step):
    if name == "kessler" and view in ("down", "up") and step != "stand":
        pal = {**COMMON, **CHARS[name]}
        rows = [""] + VIEWS[name][view] + KESSLER_STEP[step]
        im = Image.new("RGBA", (16, 24), (0, 0, 0, 0))
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch != ".":
                    im.putpixel((x, y), hex2rgba(pal[ch]))
        return im
    return frame_raw(name, view, step)


def frame_raw(name, view, step):
    pal = {**COMMON, **CHARS[name]}
    rows = VIEWS[name][view]
    if name in ("sam", "ruth"):
        rows = autoshade(rows, "strands" if name == "sam" else "curls")
    rows = rows + (LEGS_SIDE if view == "left" else LEGS_FRONT)[step]
    assert len(rows) == 24, (name, view, len(rows))
    im = Image.new("RGBA", (16, 24), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        assert len(row) == 16, (name, view, y, row, len(row))
        for x, ch in enumerate(row):
            if ch != ".":
                im.putpixel((x, y), hex2rgba(pal[ch]))
    return im


MOODS = ["normal", "sorpresa", "serio", "alegre"]

# Cambios de cara por expresión: (fila, columna, carácter) sobre la vista de frente.
FACE_EDITS = {
    "sam": {
        "sorpresa": [(11, 7, "k"), (11, 8, "k"), (12, 7, "k"), (12, 8, "k")],
        "serio": [(11, 7, "S"), (11, 8, "S"), (7, 5, "d"), (7, 6, "d"), (7, 9, "d"), (7, 10, "d")],
        "alegre": [(11, 6, "r"), (11, 7, "W"), (11, 8, "W"), (11, 9, "r"), (11, 3, "R"), (11, 12, "R")],
    },
    "ruth": {
        "sorpresa": [(11, 7, "k"), (11, 8, "k"), (7, 4, "k"), (7, 5, "k"), (7, 10, "k"), (7, 11, "k")],
        "serio": [(11, 7, "S"), (11, 8, "S"), (8, 4, "k"), (8, 5, "k"), (8, 10, "k"), (8, 11, "k")],
        "alegre": [(11, 6, "r"), (11, 7, "W"), (11, 8, "W"), (11, 9, "r"), (9, 4, "k"), (9, 5, "k"), (9, 10, "k"), (9, 11, "k"), (10, 5, "s"), (10, 10, "s")],
    },
    "kessler": {
        "sorpresa": [(11, 7, "k"), (11, 8, "k"), (7, 3, "s"), (7, 4, "s"), (7, 11, "s"), (7, 12, "s"), (6, 4, "d"), (6, 5, "d"), (6, 10, "d"), (6, 11, "d")],
        "serio": [(11, 7, "m"), (11, 8, "m"), (8, 6, "d"), (8, 9, "d"), (7, 6, "d"), (7, 9, "d")],
        "alegre": [(11, 7, "W"), (11, 8, "W"), (8, 4, "k"), (8, 5, "k"), (8, 10, "k"), (8, 11, "k"), (9, 5, "s"), (9, 10, "s")],
    },
}


def portrait(name, mood):
    if name in PACK_INDEX:
        return pack_frame(name, 0, 0, PACK_MOODS[name].get(mood, [])).crop((0, 0, 16, 20))
    rows = [list(r) for r in VIEWS[name]["down"]]
    for y, x, ch in FACE_EDITS[name].get(mood, []):
        rows[y][x] = ch
    rows = ["".join(r) for r in rows]
    if name in ("sam", "ruth"):
        rows = autoshade(rows, "strands" if name == "sam" else "curls")
    pal = {**COMMON, **CHARS[name]}
    im = Image.new("RGBA", (16, 20), (0, 0, 0, 0))
    for y, row in enumerate(rows[:20]):
        for x, ch in enumerate(row):
            if ch != ".":
                im.putpixel((x, y), hex2rgba(pal[ch]))
    return im


def build_portraits():
    order = ["sam", "ruth", "kessler", "margarita"]
    sheet = Image.new("RGBA", (16 * len(MOODS), 20 * len(order)), (0, 0, 0, 0))
    for c, name in enumerate(order):
        for m, mood in enumerate(MOODS):
            sheet.alpha_composite(portrait(name, mood), (m * 16, c * 20))
    sheet.save(os.path.join(OUT, "portraits.png"))
    bg = Image.new("RGBA", sheet.size, (43, 58, 99, 255))
    bg.alpha_composite(sheet)
    bg.resize((sheet.width * 10, sheet.height * 10), Image.NEAREST).save(os.path.join(PREV, "portraits.png"))


# ------------------------------------------------------------------ Sam y Ruth desde el pack
# Daniel prefirió la personalidad de los personajes del pack de piano_no_renshu
# (CC0), pero sus colores chocaban con el juego. Aquí se recolorean con la paleta
# del laboratorio. Ojo: en el pack la fila 1 mira a la DERECHA y la 3 a la
# izquierda (por eso al principio Sam "caminaba al revés").

PACK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "source", "piano_characters.png")
PACK_INDEX = {"sam": 5, "ruth": 8, "margarita": 6}
PACK_ROWS = [0, 3, 2, 1]  # abajo, izquierda, arriba, derecha

PACK_SRC = {
    "#000048": "k", "#006db6": "b", "#2092db": "B", "#ffb692": "s", "#ffdbb6": "S",
    "#ffffff": "W", "#ff6d6d": "p", "#ff2448": "r", "#b66d24": "o", "#ffff92": "y",
}


def pack_color(name, ch, y):
    """Color nuevo según personaje, símbolo original y fila (cabeza o cuerpo)."""
    head = y <= 12
    skin, skin_s, skin_l = "#f6d0a8", "#dca27e", "#fbe2c4"
    if ch == "k":
        return "#1c1830"
    if name == "margarita":
        # base de pelo largo: canas plateadas, cara clara, rebeca morada y falda lavanda
        return {"s": "#d6d6de", "p": "#a9a9b8", "S": skin, "o": "#7a4a9a" if not head else "#8a8a9a",
                "B": "#9a6ac0", "y": "#8a5cb0", "M": "#b4504a", "W": "#fffbe8"}[ch]
    if ch == "W" and not (name == "sam" and not head):
        return "#fffbe8"
    if ch == "s":
        return skin
    if ch == "S":
        return skin_l
    if name == "sam":
        if head:
            return {"b": "#4a4470", "B": "#6a6494", "p": "#b4504a" if y == 11 else skin_s, "r": "#c83a3a", "o": "#6e4c2c", "y": "#fed018"}[ch]
        # chaleco y pantalón marrones, camisa crema, corbata granate
        if ch == "W":
            return "#f4ecd8"
        return {"b": "#5c402c", "B": "#8a6446", "p": skin_s, "r": "#8e2a2a", "o": "#3a281c", "y": "#fed018"}[ch]
    # ruth
    if head:
        return {"r": "#cc4a2e", "p": "#f08a5a" if y <= 6 else ("#b4504a" if y == 11 else "#f0a39a"), "B": "#bfe6ff", "b": "#3e3a5c", "o": "#fed018", "y": "#fed018"}[ch]
    return {"r": "#cc4a2e", "p": "#f08a5a", "B": "#f4ecd8", "b": "#d8c7a4", "o": "#4a3426", "y": "#efe4cc", "D": "#2f7a74", "E": "#22605c"}[ch]


def pack_frame(name, row, col, edits=()):
    src = Image.open(PACK).convert("RGBA")
    base_y = PACK_INDEX[name] * 96 + row * 24
    im = Image.new("RGBA", (16, 24), (0, 0, 0, 0))
    grid = []
    for y in range(24):
        line = []
        for x in range(16):
            c = src.getpixel((col * 16 + x, base_y + y))
            line.append("." if c[3] == 0 else PACK_SRC["#%02x%02x%02x" % c[:3]])
        grid.append(line)
    if name == "ruth":
        # el uniforme marino del pack pasa a vestido (solo el interior, no el contorno)
        def edge_r(x, y):
            return any(not (0 <= x + dx < 16 and 0 <= y + dy < 24) or grid[y + dy][x + dx] == "." for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        for y in range(13, 19):
            for x in range(16):
                if grid[y][x] == "k" and not edge_r(x, y):
                    grid[y][x] = "D" if (x + y) % 5 else "E"
    if name == "margarita":
        # la boca: los píxeles rosados rodeados de cara
        for y in (11, 12):
            for x in range(1, 15):
                if grid[y][x] == "p" and "S" in (grid[y][x - 1], grid[y][x + 1]):
                    grid[y][x] = "M"
    for y, x, ch in edits:
        grid[y][x] = ch
    for y in range(24):
        for x in range(16):
            ch = grid[y][x]
            if ch == ".":
                continue
            color = ch if ch.startswith("#") else pack_color(name, ch, y)
            im.putpixel((x, y), hex2rgba(color))
    return im


PACK_MOODS = {
    "margarita": {
        "sorpresa": [(11, 7, "#1c1830"), (11, 8, "#1c1830"), (12, 7, "#1c1830"), (12, 8, "#1c1830"), (7, 5, "#6a6a7a"), (7, 10, "#6a6a7a")],
        "serio": [(11, 6, "#1c1830"), (11, 7, "#1c1830"), (11, 8, "#1c1830"), (11, 9, "#1c1830"), (8, 6, "#6a6a7a"), (8, 9, "#6a6a7a")],
        "alegre": [(11, 6, "#b4504a"), (11, 7, "#fffbe8"), (11, 8, "#fffbe8"), (11, 9, "#b4504a"), (12, 6, "#f0a39a"), (12, 9, "#f0a39a")],
    },
    "sam": {
        "sorpresa": [(11, 7, "#1c1830"), (11, 8, "#1c1830"), (12, 7, "#1c1830"), (12, 8, "#1c1830"), (7, 4, "#1c1830"), (7, 11, "#1c1830"), (10, 13, "#8fd3ff")],
        "serio": [(11, 6, "#1c1830"), (11, 7, "#1c1830"), (11, 8, "#1c1830"), (11, 9, "#1c1830"), (7, 6, "#1c1830"), (7, 9, "#1c1830")],
        "alegre": [(11, 6, "#b4504a"), (11, 7, "#fffbe8"), (11, 8, "#fffbe8"), (11, 9, "#b4504a"), (10, 3, "#f0a39a"), (10, 12, "#f0a39a")],
    },
    "ruth": {
        "sorpresa": [(11, 7, "#1c1830"), (11, 8, "#1c1830"), (12, 7, "#1c1830"), (12, 8, "#1c1830"), (7, 4, "#1c1830"), (7, 11, "#1c1830")],
        "serio": [(11, 6, "#1c1830"), (11, 7, "#1c1830"), (11, 8, "#1c1830"), (11, 9, "#1c1830"), (7, 5, "#1c1830"), (7, 10, "#1c1830")],
        "alegre": [(11, 6, "#b4504a"), (11, 7, "#fffbe8"), (11, 8, "#fffbe8"), (11, 9, "#b4504a"),(12, 6, "#f0a39a"), (12, 9, "#f0a39a")],
    },
}


def build():
    order = ["sam", "ruth", "kessler", "margarita"]
    sheet = Image.new("RGBA", (64, 24 * 4 * len(order)), (0, 0, 0, 0))
    for c, name in enumerate(order):
        for d, view in enumerate(["down", "left", "up", "right"]):
            for f, step in enumerate(["stand", "a", "stand", "b"]):
                if name in PACK_INDEX:
                    im = pack_frame(name, PACK_ROWS[d], f)
                else:
                    src = "left" if view == "right" else view
                    im = frame(name, src, step)
                    if view == "right":
                        im = im.transpose(Image.FLIP_LEFT_RIGHT)
                sheet.alpha_composite(im, (f * 16, (c * 4 + d) * 24))
    sheet.save(os.path.join(OUT, "characters.png"))
    # vista previa: cada personaje en una columna, x6
    big = Image.new("RGBA", (64 * 4 + 60, 96), (60, 66, 92, 255))
    for c in range(4):
        big.alpha_composite(sheet.crop((0, c * 96, 64, c * 96 + 96)), (c * (64 + 20), 0))
    big.resize((big.width * 6, big.height * 6), Image.NEAREST).save(os.path.join(PREV, "characters.png"))
    # primer plano: cuadro quieto de frente y de perfil de cada uno, x10
    close = Image.new("RGBA", (6 * 20, 26), (60, 66, 92, 255))
    for c in range(3):
        close.alpha_composite(sheet.crop((0, c * 96, 16, c * 96 + 24)), (c * 40, 1))
        close.alpha_composite(sheet.crop((0, c * 96 + 24, 16, c * 96 + 48)), (c * 40 + 18, 1))
    close.resize((close.width * 10, close.height * 10), Image.NEAREST).save(os.path.join(PREV, "characters_close.png"))
    print("ok", sheet.size)


def build_bike():
    """Sam en bici visto de lado (hacia la derecha), 4 cuadros de pedaleo.
    Mismo estilo que el resto: colores planos de la paleta y contorno de tinta."""
    import math
    W, H, N = 40, 34, 4
    FH, OY = 38, 4  # alto final y desplazamiento de la bici hacia abajo
    INK = hex2rgba("#1c1830")
    sheet = Image.new("RGBA", (W * N, FH), (0, 0, 0, 0))
    torso = pack_frame("sam", PACK_ROWS[3], 0).crop((0, 0, 16, 19))
    rear, front, crank = (9, 26), (31, 26), (19, 26)

    def line(px, a, b, color, thick=1):
        (x0, y0), (x1, y1) = a, b
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1):
            x = round(x0 + (x1 - x0) * i / n)
            y = round(y0 + (y1 - y0) * i / n)
            for dx in range(thick):
                for dy in range(thick):
                    if 0 <= x + dx < W and 0 <= y + dy < H:
                        px[x + dx, y + dy] = hex2rgba(color)

    def outline(im):
        src = im.copy()
        a, b = src.load(), im.load()
        for y in range(H):
            for x in range(W):
                if a[x, y][3]:
                    continue
                if any(0 <= x + dx < W and 0 <= y + dy < H and a[x + dx, y + dy][3] and a[x + dx, y + dy] != INK
                       for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    b[x, y] = INK

    for f in range(N):
        im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        px = im.load()
        ang = f * math.pi / 2
        # pierna de atrás (más oscura), por detrás del cuadro
        hip = (16, 17)
        pb = (round(crank[0] - 3 * math.cos(ang)), round(crank[1] - 3 * math.sin(ang)))
        kb = (round((hip[0] + pb[0]) / 2 + 3), round((hip[1] + pb[1]) / 2 - 2))
        line(px, hip, kb, "#3a281c", 2)
        line(px, kb, pb, "#3a281c", 2)
        px[pb[0] + 1, pb[1]] = INK
        # ruedas: neumático de tinta, llanta gris y radios que giran
        for cx, cy in (rear, front):
            for t in range(72):
                a = t * math.pi / 36
                px[round(cx + 6.5 * math.cos(a)), round(cy + 6.5 * math.sin(a))] = INK
                px[round(cx + 5.4 * math.cos(a)), round(cy + 5.4 * math.sin(a))] = hex2rgba("#8a8a9a")
            for k in range(2):
                a = ang / 2 + k * math.pi / 2
                for r in range(1, 5):
                    px[round(cx + r * math.cos(a)), round(cy + r * math.sin(a))] = hex2rgba("#c2c2c8")
                    px[round(cx - r * math.cos(a)), round(cy - r * math.sin(a))] = hex2rgba("#c2c2c8")
            px[cx, cy] = INK
        # cuadro rojo, sillín y manillar
        red = "#c83a3a"
        line(px, rear, crank, red, 1)
        line(px, rear, (15, 17), red, 1)
        line(px, (15, 17), crank, red, 2)
        line(px, (15, 17), (28, 17), red, 2)
        line(px, crank, (28, 17), red, 2)
        line(px, (28, 15), front, "#8a8a9a", 1)
        line(px, (12, 15), (17, 15), "#3a281c", 2)
        line(px, (28, 12), (30, 12), "#3a281c", 1)
        line(px, (28, 12), (28, 16), "#8a8a9a", 1)
        # biela y pedal delantero
        pf = (round(crank[0] + 3 * math.cos(ang)), round(crank[1] + 3 * math.sin(ang)))
        line(px, crank, pf, "#8a8a9a", 1)
        outline(im)
        bike = im
        im = Image.new("RGBA", (W, FH), (0, 0, 0, 0))
        im.alpha_composite(bike, (0, OY))
        # Sam: el torso del sprite de siempre (hasta la cintura), sentado en el sillín
        im.alpha_composite(torso, (8, OY + 17 - 19 + (1 if f % 2 else 0)))
        # pierna de delante, encima de todo
        kf = (round((hip[0] + pf[0]) / 2 + 3), round((hip[1] + pf[1]) / 2 - 2))
        leg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        lp = leg.load()
        line(lp, hip, kf, "#5c402c", 2)
        line(lp, kf, pf, "#5c402c", 2)
        lp[pf[0], pf[1] + 1] = hex2rgba("#3a281c")
        lp[pf[0] + 1, pf[1] + 1] = hex2rgba("#3a281c")
        outline(leg)
        im.alpha_composite(leg, (0, OY))
        # brazo hacia el manillar
        arm = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ap = arm.load()
        line(ap, (18, 13), (27, 12), "#f4ecd8", 1)
        ap[28, 12] = hex2rgba("#f6d0a8")
        outline(arm)
        im.alpha_composite(arm, (0, OY + (1 if f % 2 else 0)))
        sheet.alpha_composite(im, (f * W, 0))
    sheet.save(os.path.join(OUT, "sam_bike.png"))
    sheet.resize((sheet.width * 8, sheet.height * 8), Image.NEAREST).save(os.path.join(PREV, "sam_bike.png"))
    print("bike", sheet.size)


if __name__ == "__main__":
    build()
    build_portraits()
    build_bike()
