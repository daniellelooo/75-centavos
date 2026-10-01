# Paleta única del juego. Mezcla los tonos de Kenney (madera, metal) con los
# del pack de personajes (contorno azul noche) y el ámbar de los CRT.

PALETTE = {
    ".": None,
    # contornos y sombras
    "k": "#1c1830",
    "K": "#2e2a48",
    "s": "#3e3a5c",
    # metal / plástico gris
    "g": "#5c5c66",
    "G": "#7a7a86",
    "h": "#9c9ca6",
    "H": "#c2c2c8",
    "w": "#dfdfe2",
    "W": "#f7f7f2",
    # madera (Kenney)
    "d": "#8f673f",
    "D": "#6e4c2c",
    "b": "#b98b5e",
    "B": "#c8a480",
    "l": "#e6dabf",
    # plástico beige de los 80
    "p": "#e0d1af",
    "P": "#ece2cd",
    "q": "#b4a78c",
    "Q": "#8e8268",
    # ámbar CRT
    "a": "#3a0d0a",
    "m": "#5e1210",
    "A": "#d35600",
    "y": "#fed018",
    "Y": "#fff4c9",
    # luces
    "n": "#4ba86d",
    "N": "#9be3a8",
    "r": "#e8344e",
    "R": "#ff8a8a",
    "u": "#2092db",
    "U": "#8fd3ff",
    # corcho y papel
    "o": "#a8743f",
    "O": "#c99560",
    "c": "#dcb27a",
    "x": "#fffbe8",
    # pared verde institucional
    "e": "#5d7a6a",
    "E": "#7c9a87",
    "f": "#93b09c",
    "F": "#a9c4b0",
    # cielo nocturno
    "z": "#0f1424",
    "Z": "#1b2440",
    "v": "#2b3a63",
    "i": "#ffe9a8",
    # suelo vinílico
    "t": "#cbbd9c",
    "T": "#bcae8d",
    "j": "#a89a7a",
    # rojo cable / tela
    "C": "#c66527",
    "M": "#a35422",
    # gata atigrada
    "1": "#d0782e",
    "2": "#9a4e1e",
    "3": "#f4e2c8",
    "4": "#e88a8a",
    "5": "#e9a256",
    # verde de pizarra
    "S": "#2f4a3c",
    "V": "#3d5e4c",
}


def rgba(ch):
    v = PALETTE[ch]
    if v is None:
        return (0, 0, 0, 0)
    return (int(v[1:3], 16), int(v[3:5], 16), int(v[5:7], 16), 255)
