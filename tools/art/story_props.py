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


def projector_screen(frame):
    """Pantalla de proyección colgada. 0: en blanco; 1: la página de Nébula de 1995;
    2: una tabla de resultados (la consulta de la sala de juntas)."""
    c = Canvas(60, 42)
    c.rect(0, 0, 60, 3, "K")
    c.box(2, 2, 56, 36, "W")
    c.rect(29, 38, 2, 4, "g")
    if frame == 1:
        c.rect(4, 4, 52, 32, "h")
        c.rect(4, 4, 52, 6, "u")
        c.hline(7, 6, 26, "W")
        c.hline(7, 8, 16, "U")
        for i, y in enumerate((13, 17, 21, 25)):
            c.hline(7, y, 34 - i * 5, "s")
            c.put(6, y, "u")
        c.box(40, 13, 13, 14, "y")
        c.ascii(42, 15, ["k.k.k.k.k", ".k.k.k.k.", "k.k.k.k.k"])
        c.rect(7, 30, 20, 3, "U")
    elif frame == 2:
        c.rect(4, 4, 52, 32, "x")
        c.rect(6, 6, 48, 4, "A")
        for y in range(12, 34, 4):
            c.hline(6, y, 48, "H")
            c.hline(8, y + 1, 14, "s")
            c.hline(30, y + 1, 6 + (y * 7) % 12, "s")
            c.hline(46, y + 1, 6, "n")
        c.vline(28, 6, 28, "H")
        c.vline(44, 6, 28, "H")
    return c


def audience(frame, suits=False):
    """Una fila de gente sentada vista de espaldas: cabezas y hombros. En el cuadro
    1 algunas cabezas se mueven (murmullo o aplauso)."""
    c = Canvas(100, 22)
    hair = ["d", "D", "k", "c", "G", "o", "K", "h"]
    shirt = ["u", "r", "n", "q", "U", "C", "S", "A"] if not suits else ["s", "K", "s", "g", "K", "s"]
    for i in range(6):
        x = 2 + i * 16
        bob = 1 if frame == 1 and i % 2 == 0 else 0
        # respaldo de la silla
        c.box(x, 12, 14, 10, "D")
        c.rect(x + 2, 13, 10, 2, "d")
        # hombros y cabeza
        c.box(x + 1, 8 - bob, 12, 7, shirt[i % len(shirt)])
        c.disc(x + 7, 4 - bob, 4, hair[(i * 3) % len(hair)])
        c.put(x + 7, 0 - bob, hair[(i * 3) % len(hair)])
    return c


def wall_map(frame):
    """Carta grande del Atlántico en la pared de operaciones. El convoy (rojo) va al
    norte en el cuadro 0 y gira al sur en el 1."""
    c = Canvas(112, 32)
    c.box(0, 0, 112, 32, "o")
    c.rect(2, 2, 108, 28, "U")
    for x in range(10, 108, 12):
        c.vline(x, 2, 28, "u")
    for y in range(8, 30, 8):
        c.hline(2, y, 108, "u")
    c.ascii(2, 2, ["FFFFFFFFFFFF....", "FFFFFFFFF.......", "FFFFFFF.........", "FFFFF...........", "FFFF............", "FFF.............", "FF..............", "F..............."])
    c.ascii(84, 14, ["......FFFFFFFFFF", "...FFFFFFFFFFFFF", ".FFFFFFFFFFFFFFF", "FFFFFFFFFFFFFFFF"])
    route = [(20, 22), (28, 20), (36, 18), (44, 17), (52, 16)]
    route += [(60, 14), (68, 12), (76, 10), (84, 9)] if frame == 0 else [(60, 18), (66, 21), (72, 24), (80, 26)]
    for x, y in route:
        c.rect(x, y, 2, 1, "r")
    end = route[-1]
    c.ascii(end[0], end[1] - 2, ["kk", "yy"])
    # la Roca Negra, donde los esperaban
    c.ascii(86, 6, [".kk.", "kKKk", ".kk."])
    return c


def teller(frame):
    """Mostrador del banco con tres ventanillas, vidrio y letreros de caja."""
    c = Canvas(112, 40)
    c.box(0, 20, 112, 20, "b")
    c.hline(1, 21, 110, "B")
    c.rect(0, 18, 112, 3, "D")
    for i in range(3):
        x = 6 + i * 36
        c.box(x, 0, 30, 20, "f")
        c.rect(x + 2, 2, 26, 14, "F")
        c.hline(x + 3, 3, 8, "W")
        c.box(x + 8, 22, 14, 6, "e")
        c.ascii(x + 10, 24, ["CAJA" if False else "xxxx"])
        c.put(x + 15 + (i == frame), 24, "k")
    c.ascii(48, 30, ["yyyyyyyyyyyyyyyy"])
    return c


def pesebre(frame):
    """Pesebre sobre una mesa con musgo: la casita, las figuras y una estrella."""
    c = Canvas(48, 30)
    c.box(0, 18, 48, 12, "D")
    c.rect(1, 16, 46, 3, "V")
    for x in range(2, 46, 3):
        c.put(x, 15, "S")
    # casita de cartón
    c.box(14, 4, 20, 13, "o")
    c.ascii(12, 0, ["......kkkkkkkkkk......", "....kkOOOOOOOOOOkk....", "..kkOOOOOOOOOOOOOOkk..", "kkOOOOOOOOOOOOOOOOOOkk"])
    c.rect(16, 8, 16, 8, "M")
    # figuras
    c.ascii(18, 10, ["u.c.r", "u.c.r", "uucrr"])
    c.ascii(4, 11, ["x.", "xx", "xx"])
    c.ascii(40, 11, [".A", "AA", "AA"])
    c.put(24, 12, "Y")
    c.ascii(23, 0, ["y" if frame == 0 else "Y"])
    c.ascii(2, 0, ["." if frame else "y"])
    c.ascii(44, 2, ["y" if frame else "."])
    return c


def long_table(frame):
    """Mesa larga de juntas, de madera brillante."""
    c = Canvas(128, 22)
    c.box(0, 0, 128, 14, "b")
    c.hline(1, 1, 126, "B")
    c.hline(1, 12, 126, "d")
    for x in (6, 118):
        c.rect(x, 14, 4, 8, "D")
    for x in range(14, 120, 20):
        c.box(x, 4, 10, 6, "x")
        c.hline(x + 2, 6, 6, "h")
    return c


def stove(frame):
    """Estufa de carbón panzuda, con su tubo hacia el techo y la puertecita encendida."""
    c = Canvas(20, 40)
    c.rect(8, 0, 4, 16, "g")
    c.vline(9, 0, 16, "G")
    c.box(4, 15, 12, 3, "K")
    c.box(2, 18, 16, 16, "K")
    c.rect(3, 19, 2, 14, "s")
    c.box(6, 24, 8, 7, "a")
    c.rect(7, 25, 6, 5, "A" if frame else "m")
    c.ascii(7, 26, ["y.y.y." if frame else ".y.y.y", "AyAyAy" if frame else "yAyAyA"])
    c.box(0, 34, 20, 3, "g")
    c.rect(3, 37, 2, 3, "K")
    c.rect(15, 37, 2, 3, "K")
    return c


def main():
    save("xmas_tree", strip([xmas_tree(0), xmas_tree(1)]))
    save("map_table", strip([map_table(0), map_table(1)]))
    save("card_sorter", strip([card_sorter(0), card_sorter(1)]))
    save("projector_screen", strip([projector_screen(0), projector_screen(1), projector_screen(2)]))
    save("audience", strip([audience(0), audience(1)]))
    save("directors", strip([audience(0, True), audience(1, True)]))
    save("wall_map", strip([wall_map(0), wall_map(1)]))
    save("teller", strip([teller(0), teller(1)]))
    save("pesebre", strip([pesebre(0), pesebre(1)]))
    save("long_table", long_table(0))
    save("stove", strip([stove(0), stove(1)]))
    print("ok historias")


if __name__ == "__main__":
    main()
