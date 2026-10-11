# Aso Beats — Beat Mağazası

Siyah-gri temalı, açılış animasyonlu beat satış sitesi. Next.js 16 ile yazıldı, Vercel'e yüklenmeye hazır.

**Sayfalar:** Ana sayfa · Beat detay · Hakkımda · SSS · Bana Ulaş (iletişim formu) · Sipariş/indirme sayfası · Admin panel (`/admin`)

**Öne çıkanlar**
- Kaliteli açılış ekranı (“ASO BEATS” animasyonu, oturum başına bir kez gösterilir, tıklayınca geçilir)
- Her beat için 15 saniyelik demo + dalga formu, alt kısımda sabit oynatıcı
- Admin panelinden beat ekleme: kapak/logo, açıklama, fiyat, BPM, ton, tür, etiket
- MP3'ü yüklediğin an demo **otomatik** hazırlanır (şarkının en güçlü 15 saniyesi seçilir, istersen kaydırarak değiştirirsin)
- Otomatik teslim: sipariş ödendi olunca alıcının sipariş sayfasında tam MP3 çalar ve indirilir
- Tek satış (exclusive) beatler satılınca otomatik kapanır
- Siparişler, iletişim mesajları, ayarlar (hakkımda yazısı, sosyal medya, SSS) admin panelinden yönetilir

---

## Vercel'e yükleme (adım adım)

### 1) Projeyi GitHub'a yükle
GitHub'da yeni bir depo (repository) aç ve bu klasörün içeriğini yükle.
(GitHub kullanmak istemezsen 6. adımdaki “Vercel CLI” yöntemine bak.)

### 2) Vercel'de projeyi oluştur
[vercel.com](https://vercel.com) → **Add New… → Project** → GitHub deposunu seç → **Deploy**.
Framework otomatik olarak Next.js algılanır, ek ayar gerekmez.

### 3) Admin şifresini ekle
Proje → **Settings → Environment Variables**:

| Ad | Değer |
|---|---|
| `ADMIN_PASSWORD` | Admin paneline giriş şifren (güçlü bir şifre seç) |
| `ADMIN_SECRET` | Rastgele uzun bir metin (ör. 40 karakterlik karışık harf/rakam) |

### 4) Depolamayı bağla (ikisi de ücretsiz planla çalışır)
Proje → **Storage** sekmesi:

1. **Create Storage → Blob → Continue** → erişim (access) olarak **Public** seç → isim ver → **Create**.
   Ortam seçiminde Production ve Preview işaretli kalsın. Kapaklar, demolar ve MP3'ler burada tutulur.
   (`BLOB_READ_WRITE_TOKEN` ve `BLOB_STORE_ID` otomatik eklenir.)
2. **Create Storage → Upstash (Redis)** (Marketplace) → ücretsiz planı seç → projeye bağla.
   Beatler, siparişler, mesajlar ve ayarlar burada tutulur. (`KV_REST_API_URL` ve `KV_REST_API_TOKEN` otomatik eklenir.)

### 5) Yeniden deploy et
**Deployments** → en son deploy → **⋯ → Redeploy**. Yeni ayarlar ancak yeniden deploy sonrası aktif olur.

Ardından `https://SITEN.vercel.app/admin` adresine gir, şifrenle giriş yap ve ilk beatini ekle.
Admin panelinde sarı bir uyarı görüyorsan, eksik olan bağlantıyı söyler.

### 6) (Alternatif) Vercel CLI ile yükleme
```bash
npm i -g vercel
vercel        # ilk yükleme (soruları Enter ile geçebilirsin)
vercel --prod # canlıya al
```
3–5. adımları yine Vercel panelinden yapman gerekir.

### Kendi alan adın
Proje → **Settings → Domains** bölümünden `asobeats.com` gibi alan adını ekleyebilirsin.

---

## Ödeme ve teslimat

Admin → **Ayarlar → Ödeme ve teslimat**:

- **Anında teslim:** Sipariş oluşturulunca MP3 hemen açılır. Ödeme sistemi bağlanana kadar test için ya da ücretsiz dağıtım için.
- **Manuel onay (havale/EFT):** Alıcı, yazdığın ödeme bilgilerini (IBAN vb.) ve sipariş kodunu görür. Ödemeyi görünce Admin → **Siparişler → Ödemeyi onayla**'ya basarsın; alıcının sipariş sayfası kendini yeniler ve indirme otomatik açılır.

**İleride kartla ödeme (iyzico, PayTR, Shopier…) eklemek için:** ödeme sağlayıcısının “ödeme başarılı” bildirimi (callback/webhook) geldiğinde `src/lib/db.ts` içindeki `markOrderPaid(order)` fonksiyonunu çağırman yeterli; teslimat sistemi aynen çalışır. Sipariş oluşturma kodu `src/app/api/orders/route.ts` dosyasında.

### Güvenlik notları
- Tam MP3'ler, tahmin edilemeyen rastgele bir klasör adıyla saklanır ve linki sadece ödemesi onaylanan alıcıya verilir. Sitede yalnızca 15 saniyelik demo herkese açıktır.
- Satılmış bir beati silsen bile, satın alanların indirme linki çalışmaya devam eder.

---

## Bilgisayarında çalıştırma (isteğe bağlı)

Node.js 20 veya üstü gerekir.

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD ve ADMIN_SECRET değerlerini doldur
npm run dev
```

`http://localhost:3000` adresinde açılır. Vercel depoları bağlı değilken veriler ve dosyalar proje içindeki `.data/` klasörüne kaydedilir (bu klasör Vercel'e yüklenmez).

## Dosya yapısı (kısaca)

```
src/app/(site)/         Ziyaretçi sayfaları (ana sayfa, beat, hakkımda, sss, iletişim, sipariş)
src/app/admin/          Admin paneli
src/app/api/            Sipariş, indirme, iletişim, yükleme ve admin API'leri
src/components/Intro.tsx  Açılış animasyonu
src/components/player/  Demo oynatıcı ve dalga formu
src/components/admin/   Admin paneli ekranları, demo üretici (audioTools.ts)
src/lib/                Veritabanı, oturum, tipler
```
