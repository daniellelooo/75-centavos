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


def frame(name, view, step):
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
    order = ["sam", "ruth", "kessler"]
    sheet = Image.new("RGBA", (16 * len(MOODS), 20 * len(order)), (0, 0, 0, 0))
    for c, name in enumerate(order):
        for m, mood in enumerate(MOODS):
            sheet.alpha_composite(portrait(name, mood), (m * 16, c * 20))
    sheet.save(os.path.join(OUT, "portraits.png"))
    bg = Image.new("RGBA", sheet.size, (43, 58, 99, 255))
    bg.alpha_composite(sheet)
    bg.resize((sheet.width * 10, sheet.height * 10), Image.NEAREST).save(os.path.join(PREV, "portraits.png"))


def build():
    order = ["sam", "ruth", "kessler"]
    sheet = Image.new("RGBA", (64, 24 * 4 * len(order)), (0, 0, 0, 0))
    for c, name in enumerate(order):
        for d, view in enumerate(["down", "left", "up", "right"]):
            for f, step in enumerate(["stand", "a", "stand", "b"]):
                src = "left" if view == "right" else view
                im = frame(name, src, step)
                if view == "right":
                    im = im.transpose(Image.FLIP_LEFT_RIGHT)
                sheet.alpha_composite(im, (f * 16, (c * 4 + d) * 24))
    sheet.save(os.path.join(OUT, "characters.png"))
    # vista previa: cada personaje en una columna, x6
    big = Image.new("RGBA", (64 * 3 + 40, 96), (60, 66, 92, 255))
    for c in range(3):
        big.alpha_composite(sheet.crop((0, c * 96, 64, c * 96 + 96)), (c * (64 + 20), 0))
    big.resize((big.width * 6, big.height * 6), Image.NEAREST).save(os.path.join(PREV, "characters.png"))
    # primer plano: cuadro quieto de frente y de perfil de cada uno, x10
    close = Image.new("RGBA", (6 * 20, 26), (60, 66, 92, 255))
    for c in range(3):
        close.alpha_composite(sheet.crop((0, c * 96, 16, c * 96 + 24)), (c * 40, 1))
        close.alpha_composite(sheet.crop((0, c * 96 + 24, 16, c * 96 + 48)), (c * 40 + 18, 1))
    close.resize((close.width * 10, close.height * 10), Image.NEAREST).save(os.path.join(PREV, "characters_close.png"))
    print("ok", sheet.size)


if __name__ == "__main__":
    build()
    build_portraits()
