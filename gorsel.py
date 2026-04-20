import turtle
import random

def labirent_verisi_olustur_dik(x, max_adim=3):
    """Sadece sağ-sol veya yukarı-aşağı hareket eden yol algoritması."""
    satir_degisimleri = []
    sutun_degisimleri = []
    satir_toplamlar = []
    sutun_toplamlar = []
    ziyaret_edilenler = {(0, 0)}

    m_satir, m_sutun = 0, 0

    # x-1 adım boyunca yolu örüyoruz
    for i in range(x - 1):
        deneme = 0
        while True:
            # Rastgele bir eksen seç: Sadece yatay mı, sadece dikey mi?
            eksen = random.choice(["satir", "sutun"])
            s_y, c_y = 0, 0
            
            if eksen == "satir":
                s_alt, s_ust = max(-m_satir, -max_adim), min(x - m_satir, max_adim)
                s_y = random.randint(s_alt, s_ust)
            else:
                c_alt, c_ust = max(-m_sutun, -max_adim), min(x - m_sutun, max_adim)
                c_y = random.randint(c_alt, c_ust)
            
            if s_y == 0 and c_y == 0: continue

            y_satir, y_sutun = m_satir + s_y, m_sutun + c_y
            y_koordinat = (y_satir, y_sutun)

            # Çakışma ve Bitiş (x,x) kontrolü
            if y_koordinat not in ziyaret_edilenler and y_koordinat != (x, x):
                satir_degisimleri.append(s_y)
                sutun_degisimleri.append(c_y)
                m_satir, m_sutun = y_satir, y_sutun
                satir_toplamlar.append(m_satir)
                sutun_toplamlar.append(m_sutun)
                ziyaret_edilenler.add(y_koordinat)
                break
            
            deneme += 1
            if deneme > 200: 
                max_adim += 1 # Sıkışırsa adım menzilini biraz artır
                if deneme > 500: break

    # Final adımda (x,x)'e dik bir şekilde ulaşmak için:
    fark_satir = x - m_satir
    fark_sutun = x - m_sutun
    
    if fark_satir != 0:
        satir_toplamlar.append(x)
        sutun_toplamlar.append(m_sutun)
    if fark_sutun != 0:
        satir_toplamlar.append(x)
        sutun_toplamlar.append(x)
    
    return satir_toplamlar, sutun_toplamlar

def ciz(x, s_yol, c_yol):
    ekran = turtle.Screen()
    ekran.setup(700, 700)
    ekran.title(f"Özel {x}x{x} Labirent Yolu")
    
    # Ekranı x boyutuna göre otomatik ölçeklendir
    turtle.setworldcoordinates(-1, -1, x + 1, x + 1)
    
    t = turtle.Turtle()
    t.speed(0)
    
    # Izgarayı (Grid) Çiz
    t.pencolor("#E0E0E0") # Açık gri
    for i in range(x + 1):
        t.penup(); t.goto(0, i); t.pendown(); t.goto(x, i) # Yataylar
        t.penup(); t.goto(i, 0); t.pendown(); t.goto(i, x) # Dikeyler

    # Başlangıç ve Bitiş Noktaları
    t.penup(); t.goto(0,0); t.dot(12, "green"); t.write(" BAŞLA", font=("Arial", 10, "bold"))
    t.goto(x,x); t.dot(12, "red"); t.write(" BİTİŞ", font=("Arial", 10, "bold"))

    # Yolu Çiz
    t.penup(); t.goto(0, 0); t.pendown()
    t.pencolor("#1E90FF") # Canlı mavi
    t.pensize(4)
    t.speed(3) # İzlemesi keyifli bir hız

    for i in range(len(s_yol)):
        t.goto(s_yol[i], c_yol[i])
        t.dot(7, "#1E90FF")

    print("\nÇizim tamamlandı. Çıkmak için pencereyi kapatabilirsin.")
    turtle.done()

# --- ANA PROGRAM ---
if __name__ == "__main__":
    try:
        # Kullanıcıya soruyoruz
        print("-" * 30)
        secim = int(input("Labirentin büyüklüğü ne olsun? (Örn: 10 yazarsan 10x10 olur): "))
        print(f"{secim}x{secim} labirent yolu oluşturuluyor...")
        print("-" * 30)
        
        if secim < 2:
            print("Lütfen en az 2 girin.")
        else:
            # Adım limitini boyuta göre makul bir seviyede tutuyoruz (Boyutun %30'u gibi)
            max_adim_ayari = max(2, secim // 3)
            
            s_top, c_top = labirent_verisi_olustur_dik(secim, max_adim_ayari)
            ciz(secim, s_top, c_top)
            
    except ValueError:
        print("Hata: Lütfen sadece sayı giriniz!")