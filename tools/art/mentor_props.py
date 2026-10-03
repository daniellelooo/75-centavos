"""Muebles de los lugares de los mentores nuevos: el garaje de Gus (radioaficionado)
y el cuarto de Benny (programador). Mismo estilo que build_art.py: paleta común
y contorno de tinta (lo pone save() al guardar).

Uso: python3 tools/art/mentor_props.py
"""
from build_art import Canvas, save, strip


def radio_rig(frame):
    """Equipo de radioaficionado: transceptor con diales, medidor de señal y un
    altavoz encima. frame 1: la aguja y el piloto cambian (está recibiendo)."""
    c = Canvas(34, 24)
    # altavoz y fuente de alimentación arriba
    c.box(2, 0, 14, 9, "G")
    for y in range(2, 7, 2):
        c.hline(4, y, 10, "g")
    c.box(18, 2, 14, 7, "s")
    c.rect(20, 4, 3, 2, "r" if frame else "m")
    c.rect(25, 4, 5, 1, "H")
    # transceptor
    c.box(0, 9, 34, 15, "K")
    c.rect(1, 10, 32, 1, "s")
    # pantalla de frecuencia ámbar
    c.box(3, 12, 14, 5, "a")
    c.ascii(4, 13, ["y.yy.yyy.y" if frame else "yy.y.yy.yy"])
    c.ascii(4, 14, ["Y.Y..Y.YY." if frame else ".Y.YY..Y.Y"])
    # medidor de señal con aguja
    c.box(19, 12, 9, 5, "Y")
    c.put(21 + (3 if frame else 1), 13, "k")
    c.put(21 + (3 if frame else 1), 14, "k")
    c.put(22 + (2 if frame else 0), 15, "k")
    # diales y botones
    c.disc(6, 20, 2, "h")
    c.put(6, 19, "k")
    c.disc(14, 20, 2, "h")
    c.put(15, 20, "k")
    for x in (21, 24, 27, 30):
        c.rect(x, 19, 2, 2, "G")
    c.put(30, 13, "N" if frame else "n")
    return c


def pegboard():
    """Tablero perforado con herramientas colgadas."""
    c = Canvas(44, 24)
    c.box(0, 0, 44, 24, "B")
    for y in range(3, 23, 4):
        for x in range(3, 43, 4):
            c.put(x, y, "d")
    # martillo
    c.rect(5, 4, 2, 12, "D")
    c.box(2, 3, 8, 4, "G")
    # llave inglesa
    c.rect(14, 5, 2, 13, "h")
    c.ascii(12, 3, ["h..h", "hhhh"])
    # destornilladores
    for i, col in enumerate("ruy"):
        x = 20 + i * 4
        c.rect(x, 4, 2, 5, col)
        c.rect(x, 9, 1, 8, "H")
    # rollo de cable
    c.disc(36, 9, 4, "r")
    c.disc(36, 9, 2, "B")
    # alicates
    c.ascii(31, 15, ["G.G", "GGG", ".G.", ".G.", "G.G"])
    return c


def workbench():
    """Banco de trabajo de madera con un tornillo de banco y piezas sueltas."""
    c = Canvas(48, 22)
    c.box(0, 4, 48, 6, "b")
    c.hline(1, 5, 46, "B")
    c.rect(3, 10, 4, 12, "D")
    c.rect(41, 10, 4, 12, "D")
    c.rect(3, 16, 42, 2, "d")
    # tornillo de banco
    c.box(4, 0, 9, 5, "G")
    c.rect(6, 1, 5, 1, "h")
    # piezas: una radio abierta y un soldador
    c.box(20, 1, 12, 4, "S")
    c.ascii(22, 2, ["n.y.r.u"])
    c.rect(36, 3, 8, 1, "h")
    c.put(44, 3, "A")
    return c


def qsl_cards():
    """Tarjetas QSL de todo el mundo clavadas en la pared (las que se mandan los
    radioaficionados para confirmar un contacto)."""
    c = Canvas(30, 22)
    cards = [(0, 0, "u"), (10, 1, "r"), (20, 0, "n"), (2, 11, "y"), (12, 12, "A"), (21, 11, "U")]
    for x, y, col in cards:
        c.box(x, y, 9, 10, "x")
        c.rect(x + 1, y + 1, 7, 3, col)
        c.hline(x + 2, y + 6, 5, "Q")
        c.hline(x + 2, y + 8, 4, "Q")
    return c


def tire_stack():
    """Neumáticos apilados en el rincón del garaje."""
    c = Canvas(20, 22)
    for i in range(3):
        y = 13 - i * 6
        # neumático visto un poco desde arriba: óvalo con el agujero oscuro
        c.rect(3, y, 14, 8, "K")
        c.rect(1, y + 2, 18, 4, "K")
        c.rect(2, y + 1, 16, 6, "K")
        c.hline(4, y + 1, 12, "s")
        c.rect(6, y + 3, 8, 2, "z")
        c.hline(3, y + 6, 14, "k")
    return c


def pizza_boxes():
    """Torre de cajas de pizza vacías."""
    c = Canvas(24, 16)
    for i in range(3):
        y = 10 - i * 4
        x = 1 + (i % 2)
        c.box(x, y, 21, 5, "P")
        c.hline(x + 1, y + 1, 19, "x")
        c.rect(x + 7, y + 2, 7, 1, "r")
    c.put(10, 2, "y")
    return c


def beanbag():
    """Puf blando, hundido de tanto usarlo."""
    c = Canvas(24, 16)
    c.disc(12, 10, 7, "m")
    c.rect(3, 9, 18, 6, "m")
    c.disc(11, 9, 5, "r")
    c.disc(9, 7, 2, "R")
    c.rect(5, 13, 14, 2, "a")
    return c


def poster(kind):
    """Pósteres del cuarto de Benny: 0 una nave espacial, 1 un ordenador de los 80,
    2 un robot gigante de anime, 3 una chica de anime de ojos enormes."""
    c = Canvas(18, 24)
    c.box(0, 0, 18, 24, "z")
    if kind == 0:
        for x, y in ((3, 3), (12, 5), (6, 15), (14, 18), (2, 20)):
            c.put(x, y, "W")
        c.ascii(5, 7, ["...H....", "..HwH...", ".HwuwH..", "HHwwwHH.", "..y.y..."])
        c.rect(2, 19, 14, 3, "y")
        c.hline(4, 20, 10, "a")
    elif kind == 2:
        # cabeza de robot gigante: casco blanco, antena en V amarilla y visor verde
        c.rect(1, 1, 16, 22, "v")
        c.ascii(2, 2, ["y............y", ".y..........y.", "..yy......yy..", "....yy..yy....", "......yy......"])
        c.box(4, 7, 10, 9, "W")
        c.rect(5, 8, 8, 2, "u")
        c.rect(6, 10, 6, 2, "k")
        c.ascii(6, 10, ["NN..NN"])
        c.rect(7, 13, 4, 2, "r")
        c.ascii(5, 14, ["h......h"])
        c.rect(1, 18, 16, 5, "r")
        c.ascii(3, 19, ["W.WW.W.WWW.W", "WW.W.WW.W.WW"])
    elif kind == 3:
        # chica de anime: flequillo rosa, ojos enormes y letras japonesas de mentira
        c.rect(1, 1, 16, 22, "U")
        c.ascii(14, 2, ["k", "k", ".", "k", "k", "k", ".", "k"])
        c.rect(3, 4, 10, 12, "7")
        c.rect(4, 8, 8, 8, "P")
        c.ascii(3, 7, ["7778777877", "77.7..7.77"])
        c.ascii(4, 10, ["kkW..kkW", "kuu..kuu", "kuu..kuu"])
        c.ascii(7, 14, ["rr"])
        c.ascii(4, 13, ["R......R"])
        c.rect(2, 14, 2, 6, "7")
        c.rect(12, 14, 2, 6, "8")
        c.rect(4, 16, 8, 6, "r")
        c.ascii(6, 16, ["WWWW"])
    else:
        c.box(3, 4, 12, 9, "H")
        c.rect(5, 6, 8, 5, "u")
        c.ascii(6, 7, ["N.N.N", "NNN.."])
        c.box(2, 14, 14, 4, "p")
        c.rect(3, 20, 12, 2, "r")
    return c


def soda_cans():
    """Latas de refresco sobre el suelo."""
    c = Canvas(14, 9)
    for x, col in ((0, "r"), (5, "u"), (9, "r")):
        c.box(x, 1, 5, 8, col)
        c.hline(x + 1, 2, 3, "H")
    return c


def bed():
    """Cama individual sin hacer, vista desde arriba: cabecero de madera,
    almohada torcida y la manta arrugada a un lado."""
    c = Canvas(22, 36)
    c.rect(0, 0, 22, 5, "D")
    c.hline(1, 1, 20, "d")
    c.rect(1, 5, 20, 30, "x")
    c.hline(1, 34, 20, "P")
    # almohada torcida
    c.rect(4, 7, 12, 6, "W")
    c.hline(4, 12, 12, "H")
    c.put(15, 7, "H")
    # manta verde arrugada, retirada hacia abajo y a un lado
    c.rect(1, 17, 20, 17, "n")
    c.rect(1, 17, 20, 2, "N")
    for y, x0, w in ((21, 3, 6), (25, 10, 8), (29, 4, 7)):
        c.hline(x0, y, w, "S")
    c.rect(16, 15, 5, 4, "n")
    c.put(17, 15, "N")
    return c


def server_rack(frame):
    """Armario de servidores con las luces parpadeando (dos cuadros)."""
    c = Canvas(22, 42)
    c.box(0, 0, 22, 42, "K")
    c.rect(1, 1, 20, 2, "s")
    for i in range(6):
        y = 4 + i * 6
        c.box(2, y, 18, 5, "g")
        c.hline(3, y + 1, 16, "G")
        for j in range(4):
            on = (i * 3 + j + frame) % 3 != 0
            c.put(4 + j * 2, y + 3, ("n" if (i + j) % 4 else "A") if on else "s")
        c.ascii(13, y + 2, ["hhhhh", "s.s.s"])
    c.rect(2, 40, 18, 1, "s")
    return c


def book_piles():
    """Pilas de libros y manuales en el suelo."""
    c = Canvas(26, 18)
    piles = [(0, ["u", "r", "y", "n", "U"]), (9, ["n", "A", "u"]), (16, ["r", "W", "u", "y", "A", "n"])]
    for x, cols in piles:
        for i, col in enumerate(cols):
            y = 15 - i * 3
            dx = (i % 2)
            c.box(x + dx, y, 9, 3, col)
            c.hline(x + dx + 1, y + 1, 2, "x")
    return c


def main():
    save("radio_rig", strip([radio_rig(0), radio_rig(1)]))
    save("pegboard", pegboard())
    save("workbench", workbench())
    save("qsl_cards", qsl_cards())
    save("tire_stack", tire_stack())
    save("pizza_boxes", pizza_boxes())
    save("beanbag", beanbag())
    save("posters", strip([poster(0), poster(1), poster(2), poster(3)]))
    save("server_rack", strip([server_rack(0), server_rack(1)]))
    save("book_piles", book_piles())
    save("soda_cans", soda_cans())
    save("bed", bed())
    print("ok mentores")


if __name__ == "__main__":
    main()
