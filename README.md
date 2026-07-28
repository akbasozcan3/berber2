# New Life Erkek Kuaförü — Web Sitesi

Modern berber/kuaför sitesi: online randevu, admin paneli, Telegram bildirimleri ve tam içerik yönetimi.

## Özellikler

- **Halka açık site:** Ana sayfa, hizmetler, galeri, yorumlar, hakkımızda, iletişim, online randevu
- **Admin paneli:** Randevu, müşteri, berber, hizmet, galeri, içerik ve site ayarları yönetimi
- **Randevu sistemi:** Müsaitlik takvimi, slot yönetimi, e-posta/Telegram bildirimleri
- **SEO:** Dinamik sitemap, robots.txt, meta ayarları
- **Üretim hazır:** Standalone Next.js build, Docker desteği, Vercel uyumlu

## Teknoloji

- Next.js 16 (App Router)
- React 19
- PostgreSQL + Drizzle ORM
- Tailwind CSS 4
- TypeScript

## Hızlı Başlangıç (Yerel)

### Gereksinimler

- Node.js 20+
- PostgreSQL 16+

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini oluştur
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# PostgreSQL'i başlat (Docker ile)
docker compose up -d postgres

# Veritabanı şeması ve örnek veriler
npm run db:setup

# Geliştirme sunucusu
npm run dev
```

Site: [http://localhost:3000](http://localhost:3000)  
Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

### Windows — tek tıkla başlat

```bat
SITEYI_BASLAT.bat
```

## Üretim Build

```bash
npm run build   # Standalone build oluşturur
npm run start   # .next/standalone üzerinden sunar
```

## Docker ile Deploy

```bash
cp .env.example .env
# JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD değerlerini doldurun

docker compose up -d --build
```

Uygulama `http://localhost:3000` adresinde çalışır. Yüklenen dosyalar `uploads-data` volume'ünde kalıcıdır.

## Vercel Deploy

1. GitHub reposunu Vercel'e bağlayın
2. **Vercel Postgres** (veya harici PostgreSQL) ekleyin → `DATABASE_URL` otomatik atanır
3. Ortam değişkenlerini ekleyin:
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `SITE_URL` (ör. `https://siteniz.com`)
4. Build komutu: `npm run vercel-build` (varsayılan `next build`)
5. İlk deploy sonrası veritabanını kurun:
   ```bash
   npm run db:migrate
   RUN_DB_SEED=true npm run db:seed
   ```

Vercel'de dosya yüklemeleri **Vercel Blob** üzerinden yapılır (`BLOB_READ_WRITE_TOKEN` otomatik).

## Ortam Değişkenleri

Tüm değişkenler için `.env.example` dosyasına bakın.

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `DATABASE_URL` | Evet | PostgreSQL bağlantı dizesi |
| `JWT_SECRET` | Evet | Admin oturum imzalama anahtarı |
| `ADMIN_EMAIL` | Evet | Admin giriş e-postası |
| `ADMIN_PASSWORD` | Evet | Admin giriş şifresi |
| `SITE_URL` | Evet (prod) | Canlı site URL'si |
| `TELEGRAM_BOT_TOKEN` | Hayır | Telegram bildirim botu |
| `TELEGRAM_CHAT_ID` | Hayır | Bildirim chat ID |
| `SMTP_*` | Hayır | E-posta bildirimleri |

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Standalone üretim build |
| `npm run start` | Standalone sunucu |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run db:migrate` | Veritabanı şeması |
| `npm run db:seed` | Örnek veri |
| `npm run db:setup` | migrate + seed |

## Proje Yapısı

```
app/              Next.js sayfalar ve API route'ları
components/       Admin ve paylaşılan bileşenler
lib/              Veritabanı, auth, servisler
public/uploads/   Yüklenen görseller (standalone/Docker)
scripts/          Build ve yardımcı scriptler
```

## Lisans

Özel proje — tüm hakları saklıdır.
