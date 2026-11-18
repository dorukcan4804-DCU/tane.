# tane.

Tane tane seçildi. İzmir'de haftada iki gün kapına gelen meyve kutuları, egzotik meyveler, reçel, pekmez ve bal.

## Dosyalar

| Dosya | Ne |
| --- | --- |
| `index.html` | Ana sayfa: kutular, kendi kutun, kiler, Erzak Barı, sorular, sepet ve WhatsApp siparişi |
| `vizyon.html` | Vizyon sayfası |
| `assets/app.js` | Sitenin kodu ve **ayarları** (fiyatlar, ürünler, teslimat günleri, WhatsApp numarası) |
| `assets/style.css` | Görünüm |
| `_headers` | Güvenlik başlıkları (Cloudflare Pages ve Netlify'da kendiliğinden uygulanır) |
| `kutular/index.html` | Kutu ve ambalaj prototipleri |
| `img/` | İleride gerçek fotoğraflar için |

Kurulum veya derleme gerekmez.

## Ayarlar

`assets/app.js` dosyasının en üstündeki `AYARLAR` bölümünü düzenle:

1. `whatsapp`: sipariş numarası, başında 90, boşluksuz (ör. `905321234567`).
2. `minOrder` (en az sepet, 1.250 TL) ve `ownMin` (kendi kutun en az tutarı, 1.500 TL). Bu iki sınır her teslimatın en az 500 TL kâr bırakması için konuldu; düşürmeden önce birim ekonomisine bak.
3. `BOXES` (kutular), `CATALOG` (kendi kutun ürünleri), `KILER` (reçel, pekmez, bal). O hafta olmayan ürüne `off:true` yaz, "bu hafta yok" görünür.
4. `days`: teslimat günleri ve kapanış saatleri. `left` o gün gerçekte kalan kapasitedir; dolunca `0` yap.
5. `erzak.current` ve `erzak.given`: Erzak Barı'nın gerçek sayıları. Uydurma sayı yazılmaz.
6. `social`: Instagram, YouTube, TikTok adresleri (`https://` ile). Boş olan görünmez.

## Yayına alma

**Önerilen: Cloudflare Pages.** Repoyu bağla, derleme ayarı boş kalsın. `_headers` dosyasındaki güvenlik başlıkları burada çalışır. Alan adını Cloudflare'de bağla.

GitHub Pages da çalışır (Settings → Pages → `main` / root), ama `_headers` dosyasını okumaz.

## Güvenlik

Site statiktir: sunucu, veritabanı, üye girişi ve kart bilgisi yoktur.

- Sayfa yalnızca kendi `assets/app.js` dosyasını çalıştırır (CSP); dışarıya veri göndermez.
- Ziyaretçinin yazdığı her metin düz metin olarak basılır; alanların uzunluk sınırı ve telefon kontrolü vardır.
- Tarayıcıda saklanan sepet açılışta doğrulanır; bozuk kayıt atılır.
- Site başka bir sayfanın içine gömülemez: Cloudflare Pages ya da Netlify'da `_headers` dosyası bunu engeller. (GitHub Pages bu dosyayı okumaz.)

Sitenin dışında yapılacaklar:

1. GitHub, alan adı, e-posta ve sosyal medya hesaplarında iki adımlı doğrulamayı aç.
2. Settings → Branches'ta `main` dalına koruma koy; yazma yetkisini kısıtla.
3. Bu repo herkese açık: şifre, API anahtarı ya da müşteri bilgisi asla buraya konmaz.
4. Sipariş mesajındaki tutarı ödeme linkini göndermeden önce fiyat listenle kontrol et; tutar ziyaretçinin tarayıcısında hesaplanır.
5. Kartlı ödemeye geçince kart bilgisi bu sitede alınmaz; ödeme kuruluşunun kendi sayfası kullanılır.
