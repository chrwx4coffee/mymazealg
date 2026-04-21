import turtle
import random
from collections import deque


# ---------------------------------------------------------------------------
# 1. DUVAR MODELİ
#    Her hücre (i, j) için 4 kenar: "U" (üst), "A" (alt), "S" (sağ), "L" (sol)
#    Duvar seti: {(i, j, kenar)} şeklinde saklanır.
#    Başlangıçta tüm iç duvarlar kapalıdır; algoritma seçilen duvarları kaldırır.
# ---------------------------------------------------------------------------

TERS = {"U": "A", "A": "U", "S": "L", "L": "S"}
DELTA = {"S": (1, 0), "L": (-1, 0), "U": (0, 1), "A": (0, -1)}


def tum_duvarlar(x):
    """Tüm iç duvarları kapalı olarak başlat."""
    duvarlar = set()
    for i in range(x):
        for j in range(x):
            for kenar in ("U", "A", "S", "L"):
                di, dj = DELTA[kenar]
                ni, nj = i + di, j + dj
                if 0 <= ni < x and 0 <= nj < x:
                    # Normalize: küçük hücreyi önce koy (duplikasyonu önle)
                    if (i, j) < (ni, nj):
                        duvarlar.add((i, j, kenar))
    return duvarlar


def recursive_backtracker(x):
    """
    İteratif Backtracker (stack tabanlı DFS) ile mükemmel labirent üret.
    Recursive yerine explicit stack kullanır → RecursionError yok.
    """
    ziyaret = [[False] * x for _ in range(x)]
    kaldirildi = set()

    stack = [(0, 0)]
    ziyaret[0][0] = True

    while stack:
        i, j = stack[-1]

        # Ziyaret edilmemiş komşuları bul
        yonler = list(DELTA.items())
        random.shuffle(yonler)
        komsu_bulundu = False

        for kenar, (di, dj) in yonler:
            ni, nj = i + di, j + dj
            if 0 <= ni < x and 0 <= nj < x and not ziyaret[ni][nj]:
                kaldirildi.add((i, j, kenar))
                kaldirildi.add((ni, nj, TERS[kenar]))
                ziyaret[ni][nj] = True
                stack.append((ni, nj))
                komsu_bulundu = True
                break

        if not komsu_bulundu:
            stack.pop()

    return kaldirildi


# ---------------------------------------------------------------------------
# 2. BFS İLE ÇÖZÜM YOLU
# ---------------------------------------------------------------------------

def bfs_coz(x, gecis):
    """BFS ile (0,0) → (x-1,x-1) en kısa yolunu bul."""
    baslangic = (0, 0)
    hedef = (x - 1, x - 1)
    kuyruk = deque([baslangic])
    ebeveyn = {baslangic: None}

    while kuyruk:
        i, j = kuyruk.popleft()
        if (i, j) == hedef:
            break
        for kenar, (di, dj) in DELTA.items():
            ni, nj = i + di, j + dj
            if 0 <= ni < x and 0 <= nj < x:
                if (i, j, kenar) in gecis and (ni, nj) not in ebeveyn:
                    ebeveyn[(ni, nj)] = (i, j)
                    kuyruk.append((ni, nj))

    # Yolu geri iz sürerek oluştur
    yol = []
    dugum = hedef
    while dugum is not None:
        yol.append(dugum)
        dugum = ebeveyn.get(dugum)
    yol.reverse()
    return yol


# ---------------------------------------------------------------------------
# 3. TURTLE GÖRSELLEŞTİRME
# ---------------------------------------------------------------------------

HUCRE = 40          # piksel cinsinden hücre boyutu
DUVAR_KALINLIK = 3
YOL_KALINLIK = 4

RENK_ZEMIN   = "#1A1A2E"
RENK_DUVAR   = "#E0E0E0"
RENK_YOL     = "#F39C12"
RENK_BASLAMA = "#27AE60"
RENK_BITIS   = "#E74C3C"


def hucre_merkez(i, j):
    """Hücre (i,j) için piksel merkezi."""
    return i * HUCRE + HUCRE // 2, j * HUCRE + HUCRE // 2


def gorselle(x, gecis, yol):
    toplam = x * HUCRE
    ekran = turtle.Screen()
    ekran.title("Duvar Tabanlı Labirent")
    ekran.setup(toplam + 80, toplam + 80)
    ekran.bgcolor(RENK_ZEMIN)
    ekran.tracer(0)  # Anlık çizim

    t = turtle.Turtle()
    t.hideturtle()
    t.pensize(DUVAR_KALINLIK)

    # --- Zemin karolarını çiz ---
    t.penup()
    for i in range(x):
        for j in range(x):
            cx, cy = hucre_merkez(i, j)
            # Hafif ızgara görünümü için ince border
            t.goto(i * HUCRE - toplam // 2 + 1,
                   j * HUCRE - toplam // 2 + 1)
            t.pendown()
            t.color("#16213E")
            t.begin_fill()
            for _ in range(4):
                t.forward(HUCRE - 2)
                t.left(90)
            t.end_fill()
            t.penup()

    # --- Dış sınır duvarlarını çiz ---
    t.pensize(DUVAR_KALINLIK + 2)
    t.color(RENK_DUVAR)
    t.penup()
    t.goto(-toplam // 2, -toplam // 2)
    t.pendown()
    for _ in range(4):
        t.forward(toplam)
        t.left(90)
    t.penup()

    # --- İç duvarları çiz ---
    #   Kaldırılmamış (gecis setinde olmayan) kenarları çiz.
    t.pensize(DUVAR_KALINLIK)
    t.color(RENK_DUVAR)

    for i in range(x):
        for j in range(x):
            px = i * HUCRE - toplam // 2
            py = j * HUCRE - toplam // 2

            # SAĞ duvar (i, j) → (i+1, j)
            if i < x - 1 and (i, j, "S") not in gecis:
                t.penup()
                t.goto(px + HUCRE, py)
                t.pendown()
                t.goto(px + HUCRE, py + HUCRE)
                t.penup()

            # ÜST duvar (i, j) → (i, j+1)
            if j < x - 1 and (i, j, "U") not in gecis:
                t.penup()
                t.goto(px, py + HUCRE)
                t.pendown()
                t.goto(px + HUCRE, py + HUCRE)
                t.penup()

    # --- Çözüm yolunu çiz ---
    t.pensize(YOL_KALINLIK)
    t.color(RENK_YOL)
    if yol:
        ix, iy = hucre_merkez(yol[0][0], yol[0][1])
        t.penup()
        t.goto(ix - toplam // 2, iy - toplam // 2)
        t.pendown()
        for (ci, cj) in yol[1:]:
            cx, cy = hucre_merkez(ci, cj)
            t.goto(cx - toplam // 2, cy - toplam // 2)
        t.penup()

    # --- Başlangıç ve bitiş noktaları ---
    def nokta_ciz(i, j, renk):
        cx, cy = hucre_merkez(i, j)
        t.goto(cx - toplam // 2, cy - toplam // 2 - 8)
        t.dot(18, renk)

    nokta_ciz(0, 0, RENK_BASLAMA)
    nokta_ciz(x - 1, x - 1, RENK_BITIS)

    ekran.update()
    turtle.done()


# ---------------------------------------------------------------------------
# 4. ANA AKIŞ
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    boyut = int(input("Labirent boyutu (örn. 15): "))
    gecis = recursive_backtracker(boyut)
    yol   = bfs_coz(boyut, gecis)
    print(f"Çözüm yolu uzunluğu: {len(yol)} adım")
    gorselle(boyut, gecis, yol)