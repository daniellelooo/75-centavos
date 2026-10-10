"""Muebles de las historias nuevas: el arbolito de Navidad del banco (Medianoche), la mesa
de cartas náuticas (Código Cuervo) y la clasificadora de tarjetas perforadas (La consulta).
Mismo estilo que build_art.py: paleta común y contorno de tinta al guardar.

Uso: python3 tools/art/story_props.py
"""
from build_art import Canvas, save, strip


def xmas_tree(frame):
    """Arbolito de Navidad con luces que se alternan y una estrella; maceta de barro."""
    c = Canvas(20, 32)
    rows = [(2, 1), (4, 3), (6, 4), (9, 5), (12, 6), (15, 7), (18, 8), (21, 9)]
    for y, half in rows:
        for dy in range(3):
            c.hline(10 - half - dy // 2, y + dy, (half + dy // 2) * 2, "S" if dy == 2 else "V")
    c.ascii(8, 0, [".yy.", "yYYy", ".yy."])
    lights = [(7, 6), (12, 8), (6, 11), (13, 13), (9, 15), (5, 17), (14, 19), (8, 21), (11, 23)]
    for i, (x, y) in enumerate(lights):
        c.put(x, y, ("r", "y", "u")[(i + frame) % 3] if (i + frame) % 2 == 0 else "R")
    c.rect(9, 24, 2, 2, "D")
    c.box(5, 26, 10, 6, "C")
    c.hline(6, 27, 8, "M")
    return c


def map_table(frame):
    """Mesa con una carta náutica, una ruta en rojo y alfileres de convoyes."""
    c = Canvas(52, 28)
    c.box(0, 2, 52, 18, "D")
    c.rect(2, 4, 48, 14, "U")
    # costa y tierra
    c.ascii(2, 4, ["FFFFFFFF.......", "FFFFFF.........", "FFFF...........", "FFF............", "FF.............", "F.............."])
    c.ascii(38, 12, [".......FFFF", "....FFFFFFF", "..FFFFFFFFF"])
    # ruta del convoy (cambia de rumbo en el cuadro 1)
    route = [(10, 14), (14, 13), (18, 12), (22, 11), (26, 11), (30, 10)] + ([(34, 9), (38, 8), (42, 7)] if frame == 0 else [(34, 12), (37, 14), (40, 15)])
    for x, y in route:
        c.put(x, y, "r")
    for x, y in ((12, 13), (30, 10), (42 if frame == 0 else 40, 7 if frame == 0 else 15)):
        c.put(x, y - 1, "k")
        c.put(x, y, "y")
    c.rect(3, 20, 4, 8, "d")
    c.rect(45, 20, 4, 8, "d")
    c.hline(2, 20, 48, "d")
    return c


def card_sorter(frame):
    """Clasificadora de tarjetas perforadas: tolva arriba y trece bolsillos que se llenan."""
    c = Canvas(40, 26)
    c.box(0, 6, 40, 20, "q")
    c.rect(1, 7, 38, 2, "P")
    # tolva con el mazo de tarjetas
    c.box(4, 0, 12, 8, "Q")
    c.rect(6, 1 + frame, 8, 4 - frame, "x")
    # bolsillos
    for i in range(6):
        x = 3 + i * 6
        c.box(x, 12, 5, 8, "s")
        fill = (i * 2 + frame) % 5
        c.rect(x + 1, 19 - fill, 3, fill, "x")
    c.rect(26, 2, 10, 4, "K")
    c.put(28, 3, "n" if frame else "N")
    c.put(31, 3, "A")
    return c


def main():
    save("xmas_tree", strip([xmas_tree(0), xmas_tree(1)]))
    save("map_table", strip([map_table(0), map_table(1)]))
    save("card_sorter", strip([card_sorter(0), card_sorter(1)]))
    print("ok historias")


if __name__ == "__main__":
    main()
