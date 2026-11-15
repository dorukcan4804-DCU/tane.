# tane.

Daldan kapına, 24 saatte. İzmir, Fethiye ve Antalya'da haftada bir gün, elle seçilmiş meyve ve sebze kutuları.

## İçerik

| Dosya | Ne |
| --- | --- |
| `index.html` | Site: hazır kutular, kendi kutunu kur, yan ürünler, okul programı, sepet ve WhatsApp siparişi |
| `assets/app.js` | Sitenin kodu ve ayarları (fiyatlar, şehirler, WhatsApp numarası) |
| `assets/style.css` | Sitenin görünümü |
| `_headers` | Güvenlik başlıkları (Cloudflare Pages ve Netlify'da kendiliğinden uygulanır) |
| `kutular/index.html` | Kutu ve ambalaj prototipleri (3D, açılır kapaklı), teknik şartname ve açılım şeması |
| `img/` | Ana sayfa fotoğrafları (bkz. `img/README.md`) |

Kurulum veya derleme gerektirmez.

## Yayına almadan önce

`assets/app.js` içinde `AYARLAR` yazan bölümü düzenle:

1. `whatsapp`: sipariş numarası, başında 90, boşluksuz (ör. `905321234567`).
2. Kutu fiyatları `BOXES`, ek ürünler `ADDONS`, kendi kutun ürünleri `OWN` içinde.
3. `CITIES`: teslimat günleri, kapanış saatleri, semtler. `cap` o gün hazırlanabilecek kutu sayısı, `left` gerçekte kalan kutu. Siparişler geldikçe güncelle.
4. `social`: Instagram, YouTube ve TikTok adresleri. Boş bırakılan görünmez.
5. `giftThreshold`: hediye eşiği (TL). `school.given`: bugüne kadar okullarda dağıtılan meyve paketi; gerçek sayıyı yaz.
6. Bu haftanın ürünleri ve Brix değerleri `WEEK` içinde. Brix değerleri şu an örnek; ölçüm yaptıkça değiştir.

## Yayına alma

**GitHub Pages:** Settings → Pages → Source: `Deploy from a branch`, Branch: `main`, klasör `/ (root)`. Birkaç dakika sonra site açılır.

**Alan adı bağlama:** Alan adını aldıktan sonra Settings → Pages → Custom domain alanına yaz (ör. `tane.com.tr`). Alan adı sağlayıcında GitHub'ın gösterdiği DNS kayıtlarını ekle ve "Enforce HTTPS"i aç.

**Önerilen: Cloudflare Pages.** Repo bağlanır, ayar gerekmez. `_headers` dosyasındaki güvenlik başlıkları (çerçeve içine gömülmeyi engelleme, HTTPS zorlama) sadece burada ve Netlify'da çalışır; GitHub Pages bu dosyayı okumaz.

## Ödeme

Sipariş şu an WhatsApp'a hazır mesaj olarak düşer; ödeme kapıda ya da ödeme linkiyle alınır. Kartla ödeme için şirket ve iyzico ya da PayTR hesabı açıldığında sepetteki gönder butonu ödeme linkine bağlanır.

## Yasal metinler

Mesafeli satış sözleşmesi, ön bilgilendirme formu, KVKK ve çerez metinleri sitede yer tutucu olarak duruyor. Yayından önce avukatla hazırlanıp `LEGAL` bölümüne konmalı.

## Güvenlik

Site statiktir: sunucu, veritabanı, üye girişi ve kart bilgisi yoktur. Alınan önlemler:

- **İçerik güvenlik politikası (CSP):** Sayfa yalnızca kendi `assets/` klasöründeki kodu çalıştırır. Dışarıdan eklenen ya da sayfaya sızdırılan kod çalışmaz; site hiçbir yere veri göndermez.
- **Girdi temizliği:** Ziyaretçinin yazdığı her metin (ad, adres, not, mühür yazısı) ekrana düz metin olarak basılır. Alanların uzunluk sınırı ve telefon kontrolü vardır.
- **Saklanan sepet:** Tarayıcıda tutulan sepet açılışta doğrulanır; biçimi tutmayan kayıt atılır.
- **Gömülme koruması:** Site başka bir sayfanın içine gömülürse açılmaz.

Sitenin dışında yapılması gerekenler:

1. GitHub, alan adı, e-posta ve sosyal medya hesaplarında iki adımlı doğrulamayı aç. Bir sitenin ele geçirilmesinin en yaygın yolu bu hesaplardır.
2. GitHub'da `main` dalına koruma koy (Settings → Branches) ve repoya yazma yetkisini sadece gerekli kişilere ver.
3. Bu repo herkese açıktır: şifre, API anahtarı ya da müşteri bilgisi asla buraya konmaz.
4. **Fiyatı siparişte doğrula.** Sipariş mesajındaki tutar ziyaretçinin tarayıcısında hesaplanır ve değiştirilebilir. Ödeme linkini gönderirken tutarı kendi fiyat listenle kontrol et.
5. Kartla ödemeye geçince kart bilgisi bu sitede alınmaz; iyzico ya da PayTR'nin kendi ödeme sayfası kullanılır.
