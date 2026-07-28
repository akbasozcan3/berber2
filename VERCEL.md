# Vercel'e Yayınlama Rehberi

Repo: https://github.com/akbasozcan3/berber2

## 1. GitHub'a bağla

Kod zaten GitHub'da. Vercel'de **Add New Project** → `akbasozcan3/berber2` reposunu seç.

## 2. Vercel Postgres ekle

Proje oluşturulurken veya sonradan:

**Storage → Create Database → Postgres**

`DATABASE_URL` otomatik eklenir.

## 3. Ortam değişkenleri (Settings → Environment Variables)

| Değişken | Zorunlu | Örnek |
|----------|---------|-------|
| `JWT_SECRET` | Evet | `openssl rand -base64 32` ile üret |
| `ADMIN_EMAIL` | Evet | `admin@siteniz.com` |
| `ADMIN_PASSWORD` | Evet | Güçlü şifre |
| `SITE_URL` | Evet | `https://siteniz.vercel.app` (domain sonradan güncellenir) |
| `TELEGRAM_BOT_TOKEN` | Hayır | Bot token |
| `TELEGRAM_CHAT_ID` | Hayır | Chat ID |
| `SMTP_HOST` | Hayır | `smtp.gmail.com` |
| `SMTP_PORT` | Hayır | `587` |
| `SMTP_USER` | Hayır | Gmail adresi |
| `SMTP_PASS` | Hayır | Uygulama şifresi |
| `SMTP_FROM` | Hayır | Gönderen adres |

## 4. Blob Storage (görsel yükleme)

**Storage → Create → Blob**

Admin panelden logo/galeri yüklemek için gerekli. `BLOB_READ_WRITE_TOKEN` otomatik atanır.

## 5. Deploy

Build komutu: `npm run vercel-build` (`vercel.json` içinde tanımlı)

Deploy tamamlanınca site açılır; veritabanı henüz boş olabilir.

## 6. Veritabanını kur (ilk kez, bir kere)

Bilgisayarında proje klasöründe:

```bash
npm install
vercel link
vercel env pull .env.local
npm run db:setup
```

Bu komut tabloları oluşturur ve admin kullanıcısını seed eder.

## 7. Canlıya al

- Site: `https://proje-adiniz.vercel.app`
- Admin: `https://proje-adiniz.vercel.app/admin`
- Admin → Ayarlar → Site URL ve marka bilgilerini güncelle
- Sayfa geçiş rengi: Admin → Ayarlar → **Sayfa Geçiş Rengi**

## Özel domain

Vercel → Settings → Domains → domain ekle → DNS kayıtlarını yap → `SITE_URL` değişkenini güncelle.

## Sorun giderme

| Sorun | Çözüm |
|-------|-------|
| Admin giriş yapamıyorum | `ADMIN_EMAIL` / `ADMIN_PASSWORD` doğru mu? `npm run db:setup` çalıştırıldı mı? |
| Görseller yüklenmiyor | Vercel Blob storage bağlı mı? |
| Randevu oluşmuyor | Postgres bağlantısı ve migrate tamam mı? |
| Build hatası | Vercel build loglarına bak; yerelde `npm run vercel-build` dene |
