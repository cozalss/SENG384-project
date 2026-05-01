# Demo Video Hazırlama Kılavuzu

İki bileşenli bir kurulum:

1. **Puppeteer otomasyonu** (`demo-walkthrough.mjs`) — tarayıcıyı kendi kendine sürer, sen sadece ekranı kaydedersin.
2. **Türkçe TTS metni** (`demo-narration-tr.txt`) — sentezlenmiş ses anlatımı için kopyala-yapıştır metin.

## Hazırlık (tek seferlik)

```bash
# 1. Demo hesaplarını seed et (3 hesap: Engineer, Healthcare, Admin)
node scripts/seed-demo-accounts.mjs

# 2. Dev server'ı başlat
npm run dev
# → Port'u not et (genelde 5173 ya da 5177)
```

## Video Çekimi

1. **OBS / ScreenRec / Windows Game Bar** ile ekran kaydını başlat (1080p, 30 fps yeterli).
2. Yeni terminalde:
   ```bash
   node scripts/demo-walkthrough.mjs --port 5177
   ```
3. Chrome açılır, otomatik akış başlar — ~4 dk 30 sn sürer.
4. Akış bittiğinde *"Demo complete"* mesajını terminalde gör → kaydı durdur.

## Ses Anlatımı

### Seçenek A — TTS (en hızlı)
1. `scripts/demo-narration-tr.txt` dosyasını aç.
2. **ElevenLabs** (önerilen) → Türkçe destekli bir ses seç → metni yapıştır → Generate → MP3 indir.
3. **Alternatif**: Google Cloud TTS (`tr-TR-Wavenet-E`), Microsoft Azure Speech, Murf AI.

### Seçenek B — Kendi sesin
- Sessiz bir odada, mikrofonla `demo-narration-tr.txt` dosyasını oku.
- Audacity / GarageBand'de gürültü temizliği yap.

## Birleştirme (CapCut / DaVinci / Premiere)

1. Yeni proje aç, ekran kaydını ana track'e koy.
2. Ses dosyasını altına ekle.
3. Senkron ayarı:
   - Anlatım sahne başlangıcına göre kayan; gerekiyorsa sahneyi 0.5–1.5x arası **video hızını** ayarla, ses orijinal hızda kalır.
   - Form doldurma kısımlarını 1.5x'e hızlandır → toplam süre 5 dk altına düşer.
4. Hafif arka plan müziği ekle (kısık, %10–15 ses).
5. Export: 1080p, 30 fps, MP4, H.264.

## Demo Hesapları

| Rol | E-posta | Şifre |
|---|---|---|
| Engineer | `demo.engineer@metu.edu.tr` | `Demo1234!` |
| Healthcare Professional | `demo.doctor@metu.edu.tr` | `Demo1234!` |
| Admin | `admin@healthai.edu` | `Demo1234!` |

## Sorun Giderme

- **Puppeteer "no element found" hatası** → Site UI değişmiş olabilir. İlgili sahneyi atla, manuel devam et: script'i durdurup tarayıcıda manuel olarak tıklamaya devam et, OBS kaydı durmaz.
- **Port hatası** → `npm run dev` çıktısında görünen porta göre `--port XXXX` parametresini güncelle.
- **OTP gerçek mail göndermiyor** → `.env` dosyasında `VITE_EMAILJS_*` değişkenleri set değil. Demo akışı zaten seeded login kullanıyor, sorun olmaz; sadece Sahne 1'de OTP ekranını "anlatımda" geçer (ekran göstermez).
- **Seed verileri görünmüyor** → Firestore'da hiç ilan yoksa Dashboard boş. Yeni post oluşturarak feed'i doldur ya da admin'den birkaç sample post ekle.
