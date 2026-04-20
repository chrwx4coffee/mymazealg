import random

def labirent_verisi_olustur(x, max_adim=3):
    satir = []
    sutun = []
    satir_toplamlar = []
    sutun_toplamlar = []
    ziyaret_edilenler = {(0, 0)} # Başlangıç noktasını kaydediyoruz

    mevcut_satir_toplam = 0
    mevcut_s_toplam = 0

    # x-1 adım boyunca yolu örüyoruz
    for i in range(x - 1):
        deneme = 0
        while True:
            # ÖNEMLİ DEĞİŞİKLİK: Adım boyutu sınırlandırıldı
            # Sınırları belirlerken hem x dışına çıkmamayı hem de max_adim'i koruyoruz
            s_alt = max(-mevcut_satir_toplam, -max_adim)
            s_ust = min(x - mevcut_satir_toplam, max_adim)
            
            c_alt = max(-mevcut_s_toplam, -max_adim)
            c_ust = min(x - mevcut_s_toplam, max_adim)
            
            s_yeni = random.randint(s_alt, s_ust)
            c_yeni = random.randint(c_alt, c_ust)
            
            # (0,0) gelirse yerinde saymaması için tekrar dene (opsiyonel)
            if s_yeni == 0 and c_yeni == 0:
                continue

            y_satir_toplam = mevcut_satir_toplam + s_yeni
            y_s_toplam = mevcut_s_toplam + c_yeni
            y_koordinat = (y_satir_toplam, y_s_toplam)

            # ÇAKIŞMA VE HEDEF KONTROLÜ
            # 1. Daha önce bu noktaya geldik mi?
            # 2. Yanlışlıkla (x,x) hedefine mi vardık? (Sadece sonda varmalıyız)
            if y_koordinat not in ziyaret_edilenler and y_koordinat != (x, x):
                satir.append(s_yeni)
                sutun.append(c_yeni)
                mevcut_satir_toplam = y_satir_toplam
                mevcut_s_toplam = y_s_toplam
                satir_toplamlar.append(mevcut_satir_toplam)
                sutun_toplamlar.append(mevcut_s_toplam)
                ziyaret_edilenler.add(yeni_koordinat := y_koordinat)
                break
            
            deneme += 1
            if deneme > 200: # Alan daralırsa sıkışmamak için adımı küçültmeyi deneyebilir
                max_adim += 1 
                if deneme > 500: break

    # Son adım: Nerede olursak olalım (x, x) noktasına bağlanıyoruz
    satir.append(x - mevcut_satir_toplam)
    sutun.append(x - mevcut_s_toplam)
    satir_toplamlar.append(x)
    sutun_toplamlar.append(x)

    return satir, sutun, satir_toplamlar, sutun_toplamlar

# Kullanım
x_boyut = 10
adim_limiti = 3 # Bir hamlede en fazla kaç birim gidebilir?

satir, sutun, s_top, c_top = labirent_verisi_olustur(x_boyut, adim_limiti)

# Çıktıları Yazdır
print(f"--- {x_boyut}x{x_boyut} Labirent Yolu (Adım Limiti: {adim_limiti}) ---")
print(f"Satır Değişimleri: {satir}")
print(f"Sütun Değişimleri: {sutun}")
print("-" * 30)
koordinatlar = list(zip(s_top, c_top))
print(f"İzlenen Koordinatlar: (0,0) -> {koordinatlar}")