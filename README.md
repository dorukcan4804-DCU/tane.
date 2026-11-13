# tane.

Daldan kapına, 24 saatte. İzmir, Fethiye ve Antalya'da haftada bir gün, elle seçilmiş meyve ve sebze kutuları.

## İçerik

| Dosya | Ne |
| --- | --- |
| `index.html` | Site: hazır kutular, kendi kutunu kur, kişiselleştirme, sepet ve WhatsApp siparişi |
| `kutular/index.html` | Kutu ve ambalaj prototipleri (3D, açılır kapaklı) |
| `img/` | Ana sayfa fotoğrafları (bkz. `img/README.md`) |

Site tek dosyadır, kurulum veya derleme gerektirmez.

## Yayına almadan önce

`index.html` içinde `AYARLAR` yazan bölümü düzenle:

1. `whatsapp`: sipariş numarası, başında 90, boşluksuz (ör. `905321234567`).
2. Kutu fiyatları `BOXES`, ek ürünler `ADDONS`, kendi kutun ürünleri `OWN` içinde.
3. `CITIES`: teslimat günleri, kapanış saatleri, semtler. `cap` o gün hazırlanabilecek kutu sayısı, `left` gerçekte kalan kutu. Siparişler geldikçe güncelle.
4. Bu haftanın ürünleri ve Brix değerleri `WEEK` içinde. Brix değerleri şu an örnek; ölçüm yaptıkça değiştir.

## Yayına alma

**GitHub Pages:** Settings → Pages → Source: `Deploy from a branch`, Branch: `main`, klasör `/ (root)`. Birkaç dakika sonra site açılır.

**Alan adı bağlama:** Alan adını aldıktan sonra Settings → Pages → Custom domain alanına yaz (ör. `tane.com.tr`). Alan adı sağlayıcında GitHub'ın gösterdiği DNS kayıtlarını ekle ve "Enforce HTTPS"i aç.

Alternatif olarak repo Cloudflare Pages'e de bağlanabilir; ayar gerekmez.

## Ödeme

Sipariş şu an WhatsApp'a hazır mesaj olarak düşer; ödeme kapıda ya da ödeme linkiyle alınır. Kartla ödeme için şirket ve iyzico ya da PayTR hesabı açıldığında sepetteki gönder butonu ödeme linkine bağlanır.

## Yasal metinler

Mesafeli satış sözleşmesi, ön bilgilendirme formu, KVKK ve çerez metinleri sitede yer tutucu olarak duruyor. Yayından önce avukatla hazırlanıp `LEGAL` bölümüne konmalı.
