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
    # Rochy: programador grande y desganado. Pelo castaño revuelto, gafas grandes,
    # barba de tres días, camiseta verde que le queda justa en la barriga, vaqueros.
    "rochy": {
        "s": "#f2c79a", "S": "#d9a273", "c": "#c99a74",
        "H": "#7a5636", "h": "#523620", "d": "#2e1c12",
        "g": "#3e3a5c", "L": "#cfeeff",
        "t": "#4f7a46", "T": "#3a5c34", "l": "#689a5c", "y": "#fed018",
        "p": "#3a4a6e", "P": "#2c3858", "b": "#3a2818", "B": "#5c4030",
    },
    # Wilson (Medianoche): programador veterano del banco, pelo negro con canas en las
    # sienes, bigote espeso, gafas de pasta de los ochenta, camisa de manga corta y corbata.
    "wilson": {
        "s": "#c98e64", "S": "#a8704c",
        "h": "#2e2830", "H": "#4e4856", "G": "#a4a4b0", "M": "#2e2830", "m": "#2e2830",
        "g": "#6e4c2c", "L": "#cfeeff", "e": "#1c1830",
        "w": "#bcd8ec", "r": "#8e2a2a",
        "p": "#4a4a5c", "P": "#34344a", "b": "#2a1c14", "B": "#4a3426",
    },
    # Camilo (Medianoche): practicante de sistemas, flaco, pelo negro revuelto,
    # buzo de lana vinotinto sobre camisa blanca, bluyín y tenis.
    "camilo": {
        "s": "#d9a273", "S": "#b8845a",
        "h": "#231c26", "H": "#463c4a", "r": "#b4504a", "e": "#1c1830",
        "v": "#7a2a3a", "V": "#5a1e2a", "w": "#f4ecd8",
        "p": "#3d5a8a", "P": "#2b4266", "b": "#e8e0d0", "B": "#b4a78c",
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
    "rochy": {
        "down": [
            "................",
            "....kkkkkkkk....",
            "...kHHhHHhhhk...",
            "..khHHhHhhhhdk..",
            "..khdhhhhdhhdk..",
            "..kdhsshhsshdk..",
            "..kssssssssssk..",
            "..kggggssggggk..",
            "..kgLegssgLegk..",
            ".kSsggsSSsggsSk.",
            ".kSssssssssssSk.",
            ".kSssssrrssssSk.",
            ".kScsccsscccsSk.",
            "..kkSSSSSSSSkk..",
            ".kTttttttttttTk.",
            "kTttttllllttttTk",
            "kTtttllyyllttTTk",
            "ksTtttllllttTTsk",
            "kssTttttttttTssk",
        ],
        "up": [
            "................",
            "....kkkkkkkk....",
            "...kHHhHHhhhk...",
            "..khHHhHhhhhdk..",
            "..khhhhhdhhhdk..",
            "..khhdhhhhhhdk..",
            "..khhhhhhdhhdk..",
            "..kghhdhhhhhgk..",
            "..kshhhhhhhdsk..",
            ".kSsshhdhhhssSk.",
            ".kSssshhhhsssSk.",
            ".kSssssssssssSk.",
            ".kSSssssssssSSk.",
            "..kkSSSSSSSSkk..",
            ".kTttttttttttTk.",
            "kTttttttttttttTk",
            "kTtttttttttttTTk",
            "ksTttttttttttTsk",
            "kssTttttttttTssk",
        ],
        "left": [
            "................",
            ".....kkkkkk.....",
            "....kHHhHhhkk...",
            "...khHhhhhhhhk..",
            "..khhhhhdhhhhhk.",
            "..kdhshhhhdhhhk.",
            ".kssssshhhhdhhk.",
            "kgggsssShhhhhk..",
            "kLegssssShdhhk..",
            "kgggsssssShhhk..",
            ".kssssssSShhk...",
            ".krrsssSSShhk...",
            ".kcscsSSSSkk....",
            "..kkSSSSSk......",
            "..kkTtttTTk.....",
            ".ktttlttTTTk....",
            "ktllllttTTTk....",
            "ktlllltTTTTk....",
            "ktTlltTTsSTk....",
        ],
    },
    "camilo": {
        "down": [
            "....k.kk.kk.....",
            "...khkhhkhhk....",
            "..khhhhHhhhhkk..",
            ".khhhHHhhhhhhhk.",
            ".khhhhhhhhhhhhk.",
            ".khhhhhhhhhhhhk.",
            ".khhssshhssshhk.",
            ".khsssssssssshk.",
            ".kssssssssssssk.",
            ".ksseesssseessk.",
            ".kSssssssssssSk.",
            "..kSsssrrsssSk..",
            "...kkSSSSSSkk...",
            "...kkvwwwwvkk...",
            "..kvvVwwwwVvvk..",
            ".kvvkvvvvvvkvvk.",
            ".kvVkvVvvVvkVvk.",
            ".ksSkvvvvvvkSsk.",
            "..kkkPppppPkkk..",
        ],
        "up": [
            "....k.kk.kk.....",
            "...khkhhkhhk....",
            "..khhhhHhhhhkk..",
            ".khhhHHhhhhhhhk.",
            ".khhhhhhhhhhhhk.",
            ".khhhhhhhhhhhhk.",
            ".khhhhhhhhhhhhk.",
            ".khhhhhhhhhhhhk.",
            ".kshhhhhhhhhhsk.",
            ".kshhhhhhhhhhsk.",
            ".kSshhhhhhhhsSk.",
            "..kSshhhhhhsSk..",
            "...kkSSSSSSkk...",
            "...kkvvvvvvkk...",
            "..kvvVvvvvVvvk..",
            ".kvvkvvvvvvkvvk.",
            ".kvVkvVvvVvkVvk.",
            ".ksSkvvvvvvkSsk.",
            "..kkkPppppPkkk..",
        ],
        "left": [
            ".......k.kk.....",
            ".....kkhkhhk....",
            "....khhhhHhhkk..",
            "...khhhHHhhhhhk.",
            "..khhhhhhhhhhhk.",
            "..khhhhhhhhhhhk.",
            "..khsshhhhhhhhk.",
            ".kssssshhhhhhk..",
            ".ksssssShhhhhk..",
            ".kseessSShhhhk..",
            ".kssssSSShhhk...",
            "..krsssSShhk....",
            "...kkSSSSkk.....",
            "....kkvwvvkk....",
            "...kvvvwvvvvk...",
            "...kvvVkvvvvk...",
            "...kvVvkvVvvk...",
            "...kvvksSkvvk...",
            "....kkPpppkk....",
        ],
    },
    "wilson": {
        "down": [
            "................",
            ".....kkkkkk.....",
            "...kkhhhhHhkk...",
            "..khhhhhHHhhhk..",
            ".khhhhhhhhhhhhk.",
            ".kGhhssssshhhGk.",
            ".kGssssssssssGk.",
            ".ksMMssssssMMsk.",
            ".kgggggssgggggk.",
            ".kgLeLgssgLeLgk.",
            ".kSggggSSggggSk.",
            "..kSsmmmmmmsSk..",
            "...kkSSrrSSkk...",
            "...kkwwrrwwkk...",
            "..kwwwwrrwwwwk..",
            ".kwwkwwrrwwkwwk.",
            ".ksskwwrrwwksSk.",
            ".kSskwwwwwwkSsk.",
            "..kkkPppppPkkk..",
        ],
        "up": [
            "................",
            ".....kkkkkk.....",
            "...kkhhhhHhkk...",
            "..khhhhhHHhhhk..",
            ".khhhhhhhhhhhhk.",
            ".kGhhhhhhhhhhGk.",
            ".kGhhhhhhhhhhGk.",
            ".kshhhhhhhhhhsk.",
            ".kshhhhhhhhhhsk.",
            ".kSGhhhhhhhhGSk.",
            ".kSsGGhhhhGGsSk.",
            "..kSssssssssSk..",
            "...kkSSSSSSkk...",
            "...kkwwwwwwkk...",
            "..kwwwwwwwwwwk..",
            ".kwwkwwwwwwkwwk.",
            ".ksskwwwwwwksSk.",
            ".kSskwwwwwwkSsk.",
            "..kkkPppppPkkk..",
        ],
        "left": [
            "................",
            "......kkkkk.....",
            "....kkhhHhhkk...",
            "...khhhHHhhhhk..",
            "..khhhhhhhhhhhk.",
            "..kshhhhhhhhhGk.",
            ".kssssshhhhhGGk.",
            ".kMMsssShhhhGk..",
            "kgggggsShhhhGk..",
            "kLeLggsSShhhhk..",
            "kgggsssSSShhk...",
            ".kmmmmsSSShk....",
            "..kkSSSSSkk.....",
            "....kkwrwwkk....",
            "...kwwwrwwwwk...",
            "...kwwwkwwwwk...",
            "...kwwwkwwwwk...",
            "...kSskssSkwk...",
            "....kkPpppkk....",
        ],
    },
}

ROCHY_LEGS_FRONT = {
    "stand": [
        ".kkTTTTTTTTTTkk.",
        "...kpppPPpppk...",
        "...kppPkkPppk...",
        "...kBbbkkbbBk...",
        "...kkkk..kkkk...",
    ],
    "a": [
        ".kkTTTTTTTTTTkk.",
        "...kpppPPpppk...",
        "...kppPkkbbBk...",
        "...kBbbk.kkkk...",
        "...kkkk.........",
    ],
    "b": [
        ".kkTTTTTTTTTTkk.",
        "...kpppPPpppk...",
        "...kbbBkkPppk...",
        "...kkkk.kBbbk...",
        ".........kkkk...",
    ],
}

ROCHY_LEGS_SIDE = {
    "stand": [
        ".kkTTTTTTTk.....",
        "...kppppPk......",
        "...kpPpppk......",
        "..kBbbbbbk......",
        "..kkkkkkkk......",
    ],
    "a": [
        ".kkTTTTTTTk.....",
        "..kppkkPPk......",
        ".kppk..kPPk.....",
        "kBbbk...kbbk....",
        "kkkk.....kkk....",
    ],
    "b": [
        ".kkTTTTTTTk.....",
        "..kPPkkppk......",
        ".kPPk..kppk.....",
        "kbbbk...kBbk....",
        "kkkk.....kkk....",
    ],
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
    if name == "rochy":
        rows = rows + (ROCHY_LEGS_SIDE if view == "left" else ROCHY_LEGS_FRONT)[step]
    else:
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
    "camilo": {
        "sorpresa": [(11, 7, "k"), (11, 8, "k"), (12, 7, "k"), (12, 8, "k")],
        "serio": [(11, 6, "k"), (11, 7, "k"), (11, 8, "k"), (11, 9, "k")],
        "alegre": [(11, 6, "r"), (11, 7, "w"), (11, 8, "w"), (11, 9, "r")],
    },
    "wilson": {
        "sorpresa": [(12, 7, "k"), (12, 8, "k"), (10, 3, "s"), (10, 12, "s")],
        "serio": [(7, 4, "M"), (7, 11, "M"), (12, 7, "S"), (12, 8, "S")],
        "alegre": [(12, 6, "r"), (12, 7, "w"), (12, 8, "w"), (12, 9, "r")],
    },
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
    "rochy": {
        "sorpresa": [(11, 7, "k"), (11, 8, "k"), (12, 7, "k"), (12, 8, "k")],
        "serio": [(11, 7, "k"), (11, 8, "k"), (11, 6, "k"), (11, 9, "k"), (6, 3, "d"), (6, 4, "d"), (6, 11, "d"), (6, 12, "d")],
        "alegre": [(11, 6, "r"), (11, 7, "W"), (11, 8, "W"), (11, 9, "r"), (10, 3, "R"), (10, 12, "R")],
    },
    "kessler": {
        "sorpresa": [(11, 7, "k"), (11, 8, "k"), (7, 3, "s"), (7, 4, "s"), (7, 11, "s"), (7, 12, "s"), (6, 4, "d"), (6, 5, "d"), (6, 10, "d"), (6, 11, "d")],
        "serio": [(11, 7, "m"), (11, 8, "m"), (8, 6, "d"), (8, 9, "d"), (7, 6, "d"), (7, 9, "d")],
        "alegre": [(11, 7, "W"), (11, 8, "W"), (8, 4, "k"), (8, 5, "k"), (8, 10, "k"), (8, 11, "k"), (9, 5, "s"), (9, 10, "s")],
    },
}


# Mismo orden que CHAR en src/config.ts.
ORDER = [
    "sam", "ruth", "kessler", "margarita", "gus", "rochy",
    "lena", "kraus", "wes", "nora", "fenton", "pat",
    "iris", "penrose", "hale", "camilo", "beatriz", "wilson",
]


def auto_moods(name):
    """Expresiones de los personajes nuevos del pack: se busca la boca (el color de boca
    en la cara) y se abre (sorpresa), se cierra en una raya (serio) o sonríe (alegre)."""
    im = pack_frame(name, 0, 0)
    found = [(y, x) for y in range(9, 14) for x in range(6, 10)
             if im.getpixel((x, y))[:3] == hex2rgba(MOUTH)[:3]]
    if not found:
        return {}
    # la boca es la fila con más píxeles de boca en el centro (las mejillas quedan fuera)
    row = max({y for y, _ in found}, key=lambda r: sum(1 for y, _ in found if y == r))
    mouth = [(y, x) for y, x in found if y == row]
    ink, teeth = "#1c1830", "#fffbe8"
    xs = sorted({x for _, x in mouth})
    y0 = min(y for y, _ in mouth)
    return {
        "sorpresa": [(y, x, ink) for y, x in mouth] + [(y0 + 1, x, ink) for x in xs],
        "serio": [(y0, x, ink) for x in range(xs[0] - (len(xs) < 3), xs[-1] + 1 + (len(xs) < 3))],
        "alegre": [(y0, x, teeth) for x in xs[1:-1] or xs] + [(y0, xs[0] - 1, MOUTH), (y0, xs[-1] + 1, MOUTH)],
    }


def portrait(name, mood):
    if name in PACK_INDEX:
        moods = PACK_MOODS.get(name) or auto_moods(name)
        return pack_frame(name, 0, 0, moods.get(mood, [])).crop((0, 0, 16, 20))
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
    order = ORDER
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
PACK_INDEX = {
    "sam": 5, "ruth": 8, "margarita": 6, "gus": 3,
    "lena": 7, "kraus": 4, "wes": 10, "nora": 0, "fenton": 11, "pat": 13,
    "iris": 2, "penrose": 14, "hale": 12, "beatriz": 1,
}

# Personajes de las otras historias hechos sobre bases del pack que no usa nadie más.
# Para cada símbolo del pack: color en la cabeza (filas 0-12) y en el cuerpo. Un valor
# (corte, arriba, abajo) usa "arriba" hasta esa fila: el mismo símbolo puede ser pelo
# arriba y boca o mejillas más abajo. Con un cuarto elemento "frente", el corte solo
# vale mirando de frente (de lado o de espaldas ese símbolo es todo pelo).
SKIN, SKIN_S, MOUTH = "#f6d0a8", "#dca27e", "#b4504a"
RECOLOR = {
    # Lena (Diez días, 1995): pelo castaño oscuro con coletero verde agua, camisa de
    # cuadros roja sobre camiseta, falda de bluyín.
    "lena": {
        "head": {"o": "#4a2e1e", "s": (5, "#6e4630", SKIN_S), "S": SKIN, "r": "#2f9a8e", "p": MOUTH, "W": "#fffbe8", "b": "#3d5a8a"},
        "body": {"o": "#4a2e1e", "r": "#b8392f", "W": "#f4ecd8", "b": "#3d5a8a", "S": SKIN, "s": SKIN_S, "p": "#8e2a2a"},
    },
    # Kraus (Diez días): cofundador, pelo rubio peinado hacia atrás, gafas de sol, traje negro, corbata azul.
    "kraus": {
        "head": {"y": "#d8b878", "o": "#9a7a44", "W": "#f4e4b0", "s": SKIN, "r": MOUTH},
        "body": {"s": SKIN, "r": "#2b4fa0", "y": "#d8b878", "o": "#9a7a44", "W": "#f4ecd8"},
    },
    # Wes (Diez días): diseñador, pelo de punta teñido de verde agua, camisa morada.
    "wes": {
        "head": {"r": "#2fb3a8", "p": (8, "#7ee0d4", MOUTH), "S": SKIN, "s": SKIN_S, "b": "#6a3d9a", "B": "#8f5cc2", "y": "#fed018", "o": "#5c402c"},
        "body": {"b": "#6a3d9a", "B": "#8f5cc2", "y": "#fed018", "o": "#3a281c", "S": SKIN, "s": SKIN_S, "p": "#8e2a2a", "r": "#2fb3a8"},
    },
    # Nora (La consulta, 1974): melena caoba, vestido mostaza de los setenta.
    "nora": {
        "head": {"y": "#a0522d", "s": (7, "#c46a3c", SKIN_S), "S": SKIN, "p": MOUTH, "B": "#c9962e", "b": "#9a6e1e", "W": "#f4ecd8"},
        "body": {"B": "#c9962e", "b": "#9a6e1e", "S": SKIN, "s": SKIN_S, "p": "#5c402c", "W": "#f4ecd8", "y": "#a0522d"},
    },
    # Dr. Fenton (La consulta): matemático calvo con canas a los lados y bigote, chaqueta de tweed.
    "fenton": {
        "head": {"p": (10, "#c4c4cc", MOUTH, "frente"), "s": SKIN, "S": "#fbe2c4", "b": "#6a6a76", "B": "#8a8a96"},
        "body": {"p": "#7a5a40", "B": "#5c402c", "S": "#e8e0d0", "s": "#6a6a76", "b": "#45454f"},
    },
    # Pat (La consulta): jefa del archivo, melena negra lisa, vestido verde oliva con cinturón naranja.
    "pat": {
        "head": {"W": (6, "#4a4458", "#f4ecd8"), "s": SKIN, "S": "#fbe2c4", "p": MOUTH, "r": MOUTH, "y": "#d35600"},
        "body": {"r": "#6a7a3a", "y": "#d35600", "W": "#f4ecd8", "S": SKIN, "s": SKIN_S, "p": "#5c402c"},
    },
    # Iris (Código Cuervo, 1941): pelo castaño recogido con cinta verde, uniforme caqui.
    "iris": {
        "head": {"b": (2, "#2f5a3c", "#4a2e1e"), "B": (2, "#4a7a5c", "#6e4630"), "r": "#2f5a3c", "p": (9, "#2f5a3c", MOUTH, "frente"), "S": SKIN, "s": SKIN_S, "W": "#fffbe8"},
        "body": {"W": "#b4a078", "B": "#8a7a54", "y": "#3a281c", "S": SKIN, "s": SKIN_S, "p": "#8a7a54", "r": "#2f5a3c", "b": "#4a2e1e"},
    },
    # Penrose (Código Cuervo): criptoanalista despeinado, chaleco de tweed verde.
    "penrose": {
        "head": {"y": "#b8a07a", "o": "#7a6446", "S": SKIN, "s": SKIN_S, "p": MOUTH, "k": "#1c1830"},
        "body": {"o": "#3a4a2a", "b": "#5a6a3a", "B": "#7a8a4a", "r": "#6e4c2c", "S": "#e8e0d0", "s": SKIN_S, "y": "#b8a07a"},
    },
    # Comandante Hale (Código Cuervo): pelo gris corto, uniforme azul marino.
    "hale": {
        "head": {"p": (9, "#5c5c66", "#c97a62", "frente"), "S": SKIN, "s": SKIN_S, "B": "#2e2a48"},
        "body": {"B": "#34447a", "b": "#24305a", "s": "#24305a", "p": "#1c2440", "S": SKIN},
    },
    # Doña Beatriz (Medianoche, 1999): peinado voluminoso castaño, saco vinotinto, blusa crema.
    "beatriz": {
        "head": {"b": "#4a2e24", "B": "#6e4636", "p": (7, "#4a2e24", MOUTH, "frente"), "r": "#6e4636", "S": SKIN, "s": SKIN_S, "W": "#f4ecd8"},
        "body": {"W": "#f4ecd8", "B": "#7a2a3a", "y": "#2a1c14", "S": SKIN, "s": SKIN_S, "p": "#7a2a3a", "b": "#5a1e2a"},
    },
}
PACK_ROWS = [0, 3, 2, 1]  # abajo, izquierda, arriba, derecha

PACK_SRC = {
    "#000048": "k", "#006db6": "b", "#2092db": "B", "#ffb692": "s", "#ffdbb6": "S",
    "#ffffff": "W", "#ff6d6d": "p", "#ff2448": "r", "#b66d24": "o", "#ffff92": "y",
}


def pack_color(name, ch, y, view=0):
    """Color nuevo según personaje, símbolo original y fila (cabeza o cuerpo).
    view: fila del pack (0 de frente, 1 y 3 de lado, 2 de espaldas)."""
    head = y <= 12
    skin, skin_s, skin_l = "#f6d0a8", "#dca27e", "#fbe2c4"
    if name in RECOLOR:
        part = RECOLOR[name]["head" if head else "body"]
        v = part.get(ch, RECOLOR[name]["body" if head else "head"].get(ch))
        if v is None:
            return "#1c1830" if ch == "k" else "#ff00ff"
        if isinstance(v, tuple):
            cut, top, bottom = v[:3]
            if len(v) == 4 and view != 0:
                return top
            return top if y <= cut else bottom
        return v
    if ch == "k":
        return "#1c1830"
    if name == "gus":
        # radioaficionado: canoso, barba gris, camisa de franela roja, pantalón caqui
        if head:
            return {"S": "#a39886", "o": "#6e6556", "s": "#e6b088", "p": "#c97a62", "b": "#1c1830", "r": "#b8392f", "B": "#7a6c4c", "y": "#a39886", "W": "#fffbe8", "H": "#c4baa6"}[ch]
        return {"r": "#b8392f", "B": "#7a6c4c", "b": "#5c5038", "S": "#e6b088", "o": "#8f897c", "s": "#e6b088", "p": "#c97a62", "y": "#e8d8b0", "W": "#fffbe8"}[ch]
    if name == "rochy":
        # programador: pelo castaño revuelto, gafas de cristal claro, camiseta verde, vaqueros
        if head:
            return {"p": "#4a3020", "S": "#f2c79a", "s": "#d9a273", "B": "#bfe6ff", "b": "#3e3a5c", "M": "#b4504a", "o": "#4a3020", "r": "#b4504a", "y": "#f2c79a", "W": "#fffbe8", "H": "#6b4a30", "h": "#4a3020"}[ch]
        return {"B": "#4f7a46", "b": "#3f6638", "S": "#f2c79a", "s": "#3a4a6e", "p": "#2c3858", "o": "#3a2818", "r": "#4f7a46", "y": "#e8d8b0", "W": "#fffbe8"}[ch]
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


# Lazos del pack que en el personaje nuevo no pegan (parecían cuernos u orejas de gato):
# se quitan las filas de arriba y la cabeza se vuelve a perfilar.
TRIM = {"iris": 2, "beatriz": 2}
TRIM_HAIR = {"iris": "b", "beatriz": "b"}


def trim_top(grid, rows, hair):
    for y in range(rows + 1):
        grid[y] = ["."] * 16
    # lo que quede de lazo en las filas de abajo pasa a ser pelo
    for y in range(rows + 1, rows + 6):
        for x in range(16):
            if grid[y][x] in ("r", "p") and (x <= 3 or x >= 12):
                grid[y][x] = hair
    # nueva línea de contorno arriba: todo píxel sin nada encima
    for y in range(rows + 1, rows + 6):
        for x in range(16):
            if grid[y][x] != "." and grid[y - 1][x] == ".":
                grid[y][x] = "k"
    # y fuera píxeles sueltos (restos de cinta) que hayan quedado aislados
    for y in range(rows + 1, rows + 7):
        for x in range(16):
            if grid[y][x] == ".":
                continue
            n = sum(1 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                    if 0 <= x + dx < 16 and 0 <= y + dy < 24 and grid[y + dy][x + dx] != ".")
            if n <= 1:
                grid[y][x] = "."


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
    if name in TRIM:
        trim_top(grid, TRIM[name], TRIM_HAIR[name])
    if name == "ruth":
        # el uniforme marino del pack pasa a vestido (solo el interior, no el contorno)
        def edge_r(x, y):
            return any(not (0 <= x + dx < 16 and 0 <= y + dy < 24) or grid[y + dy][x + dx] == "." for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        for y in range(13, 19):
            for x in range(16):
                if grid[y][x] == "k" and not edge_r(x, y):
                    grid[y][x] = "D" if (x + y) % 5 else "E"
    if name == "rochy":
        # los brillos del pelo del original no son piel: de espaldas toda la cabeza es pelo,
        # de lado la mitad de atrás, y de frente las filas de arriba
        for y in range(0, 12):
            for x in range(16):
                if grid[y][x] not in ("S", "s"):
                    continue
                back = row == 2 or (row == 3 and x >= 8) or (row == 1 and x <= 7) or y <= 4
                if back:
                    grid[y][x] = "H" if grid[y][x] == "S" else "h"
    if name == "rochy" and row == 0:
        # la boca: el rosa del centro de la cara
        for y in (10, 11):
            for x in range(6, 10):
                if grid[y][x] == "p":
                    grid[y][x] = "M"
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
            color = ch if ch.startswith("#") else pack_color(name, ch, y, row)
            im.putpixel((x, y), hex2rgba(color))
    return im


PACK_MOODS = {
    "gus": {
        "sorpresa": [(11, 7, "#1c1830"), (11, 8, "#1c1830"), (6, 5, "#8f897c"), (6, 10, "#8f897c")],
        "serio": [(11, 6, "#1c1830"), (11, 7, "#1c1830"), (11, 8, "#1c1830"), (11, 9, "#1c1830")],
        "alegre": [(10, 6, "#fffbe8"), (10, 7, "#fffbe8"), (10, 8, "#fffbe8"), (10, 9, "#fffbe8")],
    },
    "rochy": {
        "sorpresa": [(10, 7, "#1c1830"), (10, 8, "#1c1830"), (11, 7, "#1c1830"), (11, 8, "#1c1830")],
        "serio": [(10, 6, "#1c1830"), (10, 7, "#1c1830"), (10, 8, "#1c1830"), (10, 9, "#1c1830")],
        "alegre": [(10, 6, "#b4504a"), (10, 7, "#fffbe8"), (10, 8, "#fffbe8"), (10, 9, "#b4504a")],
    },
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
    order = ORDER
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
    big = Image.new("RGBA", (84 * len(order), 96), (60, 66, 92, 255))
    for c in range(len(order)):
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
    rear, front, crank = (11, 27), (29, 27), (20, 26)

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
        hip = (16, 20)
        pb = (round(crank[0] - 2 * math.cos(ang)), round(crank[1] - 2 * math.sin(ang)))
        kb = (round((hip[0] + pb[0]) / 2 + 2), round((hip[1] + pb[1]) / 2 - 1))
        line(px, hip, kb, "#3a281c", 2)
        line(px, kb, pb, "#3a281c", 2)
        px[pb[0] + 1, pb[1]] = INK
        # ruedas: neumático de tinta, llanta gris y radios que giran
        for cx, cy in (rear, front):
            for t in range(72):
                a = t * math.pi / 36
                px[round(cx + 5.5 * math.cos(a)), round(cy + 5.5 * math.sin(a))] = INK
                px[round(cx + 4.4 * math.cos(a)), round(cy + 4.4 * math.sin(a))] = hex2rgba("#8a8a9a")
            for k in range(2):
                a = ang / 2 + k * math.pi / 2
                for r in range(1, 4):
                    px[round(cx + r * math.cos(a)), round(cy + r * math.sin(a))] = hex2rgba("#c2c2c8")
                    px[round(cx - r * math.cos(a)), round(cy - r * math.sin(a))] = hex2rgba("#c2c2c8")
            px[cx, cy] = INK
        # cuadro rojo, sillín y manillar
        red = "#c83a3a"
        line(px, rear, crank, red, 1)
        line(px, rear, (15, 20), red, 1)
        line(px, (15, 20), crank, red, 2)
        line(px, (15, 20), (24, 20), red, 1)
        line(px, crank, (24, 20), red, 2)
        line(px, (25, 18), front, "#8a8a9a", 1)
        line(px, (12, 18), (17, 18), "#3a281c", 2)
        line(px, (24, 16), (26, 16), "#3a281c", 1)
        line(px, (24, 16), (24, 19), "#8a8a9a", 1)
        # biela y pedal delantero
        pf = (round(crank[0] + 2 * math.cos(ang)), round(crank[1] + 2 * math.sin(ang)))
        line(px, crank, pf, "#8a8a9a", 1)
        outline(im)
        bike = im
        im = Image.new("RGBA", (W, FH), (0, 0, 0, 0))
        im.alpha_composite(bike, (0, OY))
        # Sam: el torso del sprite de siempre (hasta la cintura), sentado en el sillín
        im.alpha_composite(torso, (8, OY + 20 - 19 + (1 if f % 2 else 0)))
        # pierna de delante, encima de todo
        kf = (round((hip[0] + pf[0]) / 2 + 2), round((hip[1] + pf[1]) / 2 - 1))
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
        line(ap, (18, 16), (22, 16), "#f4ecd8", 1)
        ap[23, 16] = hex2rgba("#f6d0a8")
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
