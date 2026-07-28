"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Send, CheckCircle, XCircle } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Textarea from "@/components/admin/ui/Textarea";
import ImageUpload from "@/components/admin/ui/ImageUpload";
import WorkingHoursEditor from "@/components/admin/WorkingHoursEditor";
import BreakTimesEditor from "@/components/admin/BreakTimesEditor";
import { adminApi } from "@/lib/api/admin";
import { getPrimaryWorkingHours, parseWorkingHoursJson, serializeWorkingHours } from "@/lib/data/working-hours";
import { normalizePhoneStorage } from "@/lib/utils/format";
import { cn } from "@/lib/admin/cn";

interface TelegramLog {
  id: number;
  status: string;
  chatId: string;
  retryCount: number;
  createdAt: string;
  response?: string;
}

interface TelegramStatus {
  enabled: boolean;
  connected: boolean;
  ready: boolean;
  recipientName: string;
  lastTestAt: string | null;
  botUsername: string | null;
  chatId?: string | null;
  chatTarget?: "group" | "private" | "none";
}

function formatTestDate(iso: string | null): string {
  if (!iso) return "Henüz test edilmedi";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [logs, setLogs] = useState<TelegramLog[]>([]);
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [emailStatus, setEmailStatus] = useState<{
    configured: boolean;
    enabled: boolean;
    host?: string;
    user?: string;
    from?: string;
  } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [syncingBarbers, setSyncingBarbers] = useState(false);

  const loadTelegram = useCallback(() => {
    fetch("/api/v1/admin/telegram", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setStatus(data.status || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    adminApi.getSettings().then((data) => {
      setSettings({ ...data, notifications_telegram: "true" });
    });
    loadTelegram();
    adminApi
      .getEmailStatus()
      .then((data) => setEmailStatus(data.status))
      .catch(() => setEmailStatus(null));
  }, [loadTelegram]);

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    const payload: Record<string, string> = { ...settings, notifications_telegram: "true" };
    if (payload.phone) payload.phone = normalizePhoneStorage(payload.phone);
    if (!payload.working_hours?.trim()) {
      payload.working_hours = serializeWorkingHours(parseWorkingHoursJson(""));
    }
    // UI'ı hemen güncelle — kullanıcı anında geri bildirim alır
    setSettings(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Arka planda kaydet
    adminApi.saveSettings(payload).then(() => {
      loadTelegram();
      window.dispatchEvent(new Event("public-settings-updated"));
    }).catch(() => {
      showToast(false, "Kaydedilemedi, tekrar deneyin.");
    });
  };

  const syncBarberHours = async () => {
    const hours = getPrimaryWorkingHours(parseWorkingHoursJson(settings.working_hours || ""));
    if (!hours) {
      showToast(false, "Önce geçerli çalışma saatleri girin.");
      return;
    }
    setSyncingBarbers(true);
    try {
      const barberList = await adminApi.getBarbers();
      await Promise.all(
        barberList.map((barber) =>
          adminApi.updateBarber(barber.id, {
            workingStart: hours.open,
            workingEnd: hours.close,
          })
        )
      );
      showToast(true, "Berber randevu saatleri güncellendi.");
    } catch {
      showToast(false, "Berber saatleri güncellenemedi.");
    } finally {
      setSyncingBarbers(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/v1/admin/telegram", { method: "POST", credentials: "include" });
      const data = await res.json();
      showToast(
        res.ok,
        res.ok ? "Test bildirimi gönderildi!" : data.error || "Test başarısız"
      );
      if (data.status) setStatus(data.status);
      loadTelegram();
    } catch {
      showToast(false, "Bağlantı hatası");
    } finally {
      setTesting(false);
    }
  };

  const sendEmailTest = async () => {
    setTestingEmail(true);
    try {
      const data = await adminApi.sendTestEmail();
      showToast(true, `Test e-postası gönderildi: ${emailStatus?.user || "SMTP hesabı"}`);
      void adminApi.getEmailStatus().then((s) => setEmailStatus(s.status));
      void data;
    } catch (e) {
      showToast(false, e instanceof Error ? e.message : "E-posta testi başarısız");
    } finally {
      setTestingEmail(false);
    }
  };

  const set = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const saveBrandingImage = async (key: "logo_url" | "favicon_url", url: string) => {
    set(key, url);
    try {
      await adminApi.saveSettings({ [key]: url });
      showToast(true, key === "favicon_url" ? "Favicon kaydedildi ve site güncellendi." : "Logo kaydedildi.");
    } catch {
      showToast(false, "Görsel yüklendi ama kaydedilemedi. Kaydet'e basın.");
    }
  };

  const botConnected = status?.connected ?? false;
  const telegramReady = status?.ready ?? false;
  const recipientName = settings.telegram_recipient_name || status?.recipientName || "Mehmet Abi";

  return (
    <div>
      {toast && (
        <div
          className={cn(
            "fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg",
            toast.ok
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          )}
        >
          {toast.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.text}
        </div>
      )}

      <PageHeader
        title="Ayarlar"
        description="İşletme ve bildirim ayarları"
        actions={
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            {saved ? "Kaydedildi!" : "Kaydet"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Üst Şerit & İletişim</h3>
          <p className="text-xs text-[#71717A] mb-4">
            Telefon, kısa konum ve çalışma saatleri sitenin üst şeridinde, footer&apos;da ve iletişim sayfasında görünür.
          </p>
          <div className="space-y-4">
            <Input label="Telefon" value={settings.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="0532 710 43 55" />
            <Input label="Kısa Konum (üst şerit)" value={settings.location_short || ""} onChange={(e) => set("location_short", e.target.value)} placeholder="Taşdelen, Çekmeköy / İstanbul" />
            <Input label="Tam Adres (iletişim / harita)" value={settings.address || ""} onChange={(e) => set("address", e.target.value)} />
            <Input label="Google Maps Linki" value={settings.google_maps || ""} onChange={(e) => set("google_maps", e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">İşletme Bilgileri</h3>
          <div className="space-y-4">
            <Input label="İşletme Adı" value={settings.business_name || ""} onChange={(e) => set("business_name", e.target.value)} />
            <p className="text-xs text-[#71717A]">
              Logo yokken navbar/footer metin logosu, SEO başlıkları, admin panel ve Telegram mesajlarında görünür.
            </p>
            <Input label="E-posta" value={settings.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} />
            <Input label="Instagram" value={settings.instagram || ""} onChange={(e) => set("instagram", e.target.value)} />
            <Input label="İletişim Metni" value={settings.contact_intro || ""} onChange={(e) => set("contact_intro", e.target.value)} placeholder="Bize Ulaşın açıklaması" />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Sayfa Geçiş Rengi</h3>
          <p className="text-xs text-[#71717A] mb-6">
            Site ve admin panelinde sayfa geçişlerinde üstte görünen çizginin rengi. Değişiklik kaydettikten sonra sayfalar arasında gezinerek önizleyebilirsiniz.
          </p>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {[
                { label: "Bakır", value: "#C8703A" },
                { label: "Altın", value: "#D4A574" },
                { label: "Bordo", value: "#9E3A2E" },
                { label: "Lacivert", value: "#3B6EA8" },
                { label: "Zümrüt", value: "#3A8F6E" },
                { label: "Mor", value: "#7B4FA3" },
              ].map((preset) => {
                const active = (settings.loading_color || "#C8703A").toUpperCase() === preset.value.toUpperCase();
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => set("loading_color", preset.value)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                      active
                        ? "border-[#C8703A] bg-[#C8703A]/10 text-[#F8F8F8]"
                        : "border-white/10 bg-white/[0.03] text-[#A1A1AA] hover:border-white/20"
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.value }}
                      aria-hidden
                    />
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[88px_1fr] gap-4 items-end">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#71717A]">
                  Renk Seçici
                </span>
                <input
                  type="color"
                  value={(settings.loading_color || "#C8703A").slice(0, 7)}
                  onChange={(e) => set("loading_color", e.target.value.toUpperCase())}
                  className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
                />
              </label>
              <Input
                label="HEX Kodu"
                value={settings.loading_color || "#C8703A"}
                onChange={(e) => set("loading_color", e.target.value.toUpperCase())}
                placeholder="#C8703A"
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#71717A] mb-3">Önizleme</p>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full w-2/3 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${settings.loading_color || "#C8703A"}, #FFFFFF66)`,
                    boxShadow: `0 0 14px ${settings.loading_color || "#C8703A"}66`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Marka Görselleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ImageUpload
              label="Logo"
              folder="branding"
              value={settings.logo_url || ""}
              onChange={(url) => void saveBrandingImage("logo_url", url)}
              previewHeightClass="h-28"
            />
            <ImageUpload
              label="Favicon"
              folder="branding"
              variant="icon"
              value={settings.favicon_url || ""}
              onChange={(url) => void saveBrandingImage("favicon_url", url)}
            />
          </div>
          <p className="text-xs text-[#52525B] mt-4">
            Logo ve favicon yüklendikten sonra otomatik kaydedilir. Favicon için kare PNG veya ICO kullanın (32×32 veya 64×64).
          </p>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Bildirimler</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-green-500/20 bg-green-500/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#F8F8F8]">Telegram Bildirimleri</p>
                <p className="text-xs text-[#71717A] mt-0.5">Her yeni randevu otomatik bildirilir — kapatılamaz.</p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400 shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Açık
              </span>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-4 py-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#F8F8F8]">E-posta Bildirimleri (SMTP)</p>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Müşteriye e-posta yalnızca randevu admin panelinden onaylandığında gider.
                  </p>
                  <p className="text-[11px] text-[#52525B] mt-2">
                    {emailStatus?.configured
                      ? `Hazır · ${emailStatus.user || emailStatus.from || "SMTP"} · spam azaltma aktif`
                      : "SMTP_USER / SMTP_PASS Vercel ortam değişkenlerinde eksik"}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider shrink-0",
                    emailStatus?.configured ? "text-blue-400" : "text-yellow-400"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      emailStatus?.configured ? "bg-blue-400" : "bg-yellow-400"
                    )}
                  />
                  {emailStatus?.configured ? "Aktif" : "Eksik"}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={sendEmailTest}
                disabled={testingEmail || !emailStatus?.configured}
              >
                <Send className="w-3.5 h-3.5" />
                {testingEmail ? "Gönderiliyor..." : "Test E-postası Gönder"}
              </Button>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0D1117] divide-y divide-white/[0.06]">
              <InfoRow label="Hazır">
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className={cn("w-2 h-2 rounded-full", telegramReady ? "bg-green-400" : "bg-yellow-400")} />
                  <span className={telegramReady ? "text-green-400" : "text-yellow-400"}>
                    {telegramReady ? "Randevu bildirimi hazır" : "Chat ID veya bot eksik"}
                  </span>
                </span>
              </InfoRow>

              <InfoRow label="Bot Durumu">
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className={cn("w-2 h-2 rounded-full", botConnected ? "bg-green-400" : "bg-red-400")} />
                  <span className={botConnected ? "text-green-400" : "text-red-400"}>
                    {botConnected ? "Bağlı" : "Bağlı Değil"}
                  </span>
                  {status?.botUsername && (
                    <span className="text-[#52525B] text-xs">@{status.botUsername}</span>
                  )}
                </span>
              </InfoRow>

              <InfoRow label="Bildirim Hedefi">
                <span className="text-sm text-[#A1A1AA]">
                  {status?.chatTarget === "group"
                    ? `Grup (${status.chatId})`
                    : status?.chatTarget === "private"
                      ? `Kişisel sohbet (${status.chatId}) — gruba düşmez`
                      : "Chat ID ayarlanmamış"}
                </span>
              </InfoRow>

              <InfoRow label="Alıcı">
                <Input
                  value={settings.telegram_recipient_name ?? recipientName}
                  onChange={(e) => set("telegram_recipient_name", e.target.value)}
                  placeholder="Mehmet Abi"
                  className="!py-2 !text-sm"
                />
              </InfoRow>

              <InfoRow label="Son Test">
                <span className="text-sm text-[#A1A1AA]">
                  {formatTestDate(status?.lastTestAt ?? settings.telegram_last_test_at ?? null)}
                </span>
              </InfoRow>
            </div>

            <Button
              variant="primary"
              onClick={sendTest}
              disabled={testing}
              className="w-full"
            >
              <Send className="w-4 h-4" />
              {testing ? "Gönderiliyor..." : "Test Bildirimi Gönder"}
            </Button>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            >
              {showAdvanced ? "▲ Gelişmiş ayarları gizle" : "▼ Gelişmiş ayarlar (Chat ID, grup)"}
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                <Input
                  label="Telegram Chat ID"
                  value={settings.telegram_chat_id || ""}
                  onChange={(e) => set("telegram_chat_id", e.target.value)}
                  placeholder="Kişisel: 7766835593 · Grup: -100..."
                />
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Grup bildirimi için: botu gruba ekleyin → grupta <strong>/start</strong> yazın →
                  admin panelden &quot;Test Bildirimi Gönder&quot;e basın. Grup ID&apos;sini görmek için
                  grupta <strong>/grupid</strong> yazın. Kişisel bot sohbetine /start yazmayın; bildirimler
                  oraya gider.
                </p>
                <Input
                  label="Admin Panel URL"
                  value={settings.admin_url || ""}
                  onChange={(e) => set("admin_url", e.target.value)}
                  placeholder="https://siteniz.com/admin/appointments"
                />
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Google Değerlendirme</h3>
          <div className="space-y-4">
            <Input label="Google Puanı" value={settings.google_rating || ""} onChange={(e) => set("google_rating", e.target.value)} placeholder="4.87" />
            <Input label="Google Yorum Sayısı" value={settings.google_review_count || ""} onChange={(e) => set("google_review_count", e.target.value)} placeholder="30" />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Footer ve CTA</h3>
          <div className="space-y-4">
            <Input label="Footer Açıklama" value={settings.footer_intro || ""} onChange={(e) => set("footer_intro", e.target.value)} />
            <Input label="Footer Telif (boş = otomatik)" value={settings.footer_copyright || ""} onChange={(e) => set("footer_copyright", e.target.value)} />
            <Input label="Randevu Butonu Metni" value={settings.nav_cta_label || ""} onChange={(e) => set("nav_cta_label", e.target.value)} placeholder="Randevu Al" />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Salon Çalışma Saatleri</h3>
          <WorkingHoursEditor
            value={settings.working_hours || ""}
            onChange={(json) => set("working_hours", json)}
            onSyncBarbers={syncBarberHours}
            syncingBarbers={syncingBarbers}
          />
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Randevu Ayarları</h3>
          <div className="space-y-4">
            <Input label="Randevu Aralığı (dk)" type="number" value={settings.appointment_interval || "30"} onChange={(e) => set("appointment_interval", e.target.value)} />
            <Input label="Max İleri Tarih (gün)" type="number" value={settings.max_future_booking || "30"} onChange={(e) => set("max_future_booking", e.target.value)} />
            <Input label="Slot Başına Max Randevu" type="number" value={settings.max_bookings_per_slot || "1"} onChange={(e) => set("max_bookings_per_slot", e.target.value)} />
            <BreakTimesEditor
              value={settings.break_times || "[]"}
              onChange={(json) => set("break_times", json)}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">SEO & Site</h3>
          <div className="space-y-4">
<Input
  label="Site URL (https://...)"
  value={settings.site_url || ""}
  onChange={(e) => set("site_url", e.target.value)}
  placeholder="https://ornek.com"
/>            <p className="text-xs text-[#71717A]">
              Sitemap, robots.txt ve paylaşım linkleri bu adresi kullanır. Boş bırakılırsa canlı domain otomatik seçilir.
            </p>
            <Input label="Ana Sayfa SEO Başlık (boş = otomatik)" value={settings.seo_home_title || ""} onChange={(e) => set("seo_home_title", e.target.value)} />
            <Input label="SEO Açıklama" value={settings.seo_default_description || ""} onChange={(e) => set("seo_default_description", e.target.value)} />
            <Input label="SEO Anahtar Kelimeler (virgülle)" value={settings.seo_keywords || ""} onChange={(e) => set("seo_keywords", e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Randevu Sayfası</h3>
          <div className="space-y-4">
            <Input label="Başlık" value={settings.booking_page_title || ""} onChange={(e) => set("booking_page_title", e.target.value)} />
            <Input label="Alt Başlık" value={settings.booking_page_subtitle || ""} onChange={(e) => set("booking_page_subtitle", e.target.value)} />
            <ImageUpload label="Banner" folder="banners" value={settings.booking_page_banner || ""} onChange={(url) => set("booking_page_banner", url)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Ana Sayfa Bölümleri</h3>
          <div className="space-y-4">
            <Input label="Berberler Üst Metin" value={settings.home_team_eyebrow || ""} onChange={(e) => set("home_team_eyebrow", e.target.value)} />
            <Input label="Berberler Başlık" value={settings.home_team_title || ""} onChange={(e) => set("home_team_title", e.target.value)} />
            <Input label="Galeri Üst Metin" value={settings.home_gallery_eyebrow || ""} onChange={(e) => set("home_gallery_eyebrow", e.target.value)} />
            <Textarea
              label="Galeri Başlık (Enter ile alt satır)"
              value={settings.home_gallery_title || ""}
              onChange={(e) => set("home_gallery_title", e.target.value)}
              placeholder={"Instagram\nReels & Çalışmalar"}
              className="min-h-[80px]"
            />
            <Input label="Galeri CTA Metni" value={settings.home_gallery_cta_label || ""} onChange={(e) => set("home_gallery_cta_label", e.target.value)} placeholder="Instagram'da Gör" />
            <Input label="Galeri CTA Linki (boş = Instagram profili)" value={settings.home_gallery_cta_url || ""} onChange={(e) => set("home_gallery_cta_url", e.target.value)} placeholder="https://instagram.com/..." />
            <Input label="Yorumlar Üst Metin" value={settings.home_testimonials_eyebrow || ""} onChange={(e) => set("home_testimonials_eyebrow", e.target.value)} />
            <Textarea
              label="Yorumlar Başlık (Enter ile alt satır)"
              value={settings.home_testimonials_title || ""}
              onChange={(e) => set("home_testimonials_title", e.target.value)}
              placeholder={"Deneyimleyenlerin\nGözünden"}
              className="min-h-[80px]"
            />
            <Input label="Randevu CTA Üst Metin" value={settings.home_booking_cta_eyebrow || ""} onChange={(e) => set("home_booking_cta_eyebrow", e.target.value)} />
            <Textarea
              label="Randevu CTA Başlık (Enter ile alt satır)"
              value={settings.home_booking_cta_title || ""}
              onChange={(e) => set("home_booking_cta_title", e.target.value)}
              className="min-h-[80px]"
            />
            <Input label="Randevu CTA Açıklama" value={settings.home_booking_cta_subtitle || ""} onChange={(e) => set("home_booking_cta_subtitle", e.target.value)} />
            <ImageUpload label="Randevu CTA Arkaplan" folder="banners" value={settings.home_booking_cta_banner || ""} onChange={(url) => set("home_booking_cta_banner", url)} />
            <Input label="Deneyim Üst Metin" value={settings.experience_eyebrow || ""} onChange={(e) => set("experience_eyebrow", e.target.value)} />
            <Input label="Deneyim Başlık" value={settings.experience_title || ""} onChange={(e) => set("experience_title", e.target.value)} />
            <Input label="Yıllık Deneyim" value={settings.experience_years || ""} onChange={(e) => set("experience_years", e.target.value)} />
            <Input label="Hijyen %" value={settings.experience_hygiene || ""} onChange={(e) => set("experience_hygiene", e.target.value)} />
            <Input label="Yorumlar Giriş Metni" value={settings.reviews_section_intro || ""} onChange={(e) => set("reviews_section_intro", e.target.value)} />
            <Input label="Öne Çıkan Yorum Alıntısı" value={settings.reviews_featured_quote || ""} onChange={(e) => set("reviews_featured_quote", e.target.value)} />
            <div>
              <label className="text-xs text-[#71717A] mb-2 block">Ana Sayfa Özellik Şeridi (JSON)</label>
              <textarea
                className="w-full min-h-[120px] bg-[#0D1117] border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-mono text-[#F8F8F8]"
                value={settings.home_stats_json || ""}
                onChange={(e) => set("home_stats_json", e.target.value)}
                placeholder='[{"title":"Randevulu Hizmet","desc":"..."}]'
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Site Metin Yönetimi</h3>
          <div className="space-y-4">
            <Input label="Menü - Hizmetler" value={settings.nav_services_label || ""} onChange={(e) => set("nav_services_label", e.target.value)} />
            <Input label="Menü - Galeri" value={settings.nav_gallery_label || ""} onChange={(e) => set("nav_gallery_label", e.target.value)} />
            <Input label="Menü - Yorumlar" value={settings.nav_reviews_label || ""} onChange={(e) => set("nav_reviews_label", e.target.value)} />
            <Input label="Menü - Hakkımızda" value={settings.nav_about_label || ""} onChange={(e) => set("nav_about_label", e.target.value)} />
            <Input label="Menü - İletişim" value={settings.nav_contact_label || ""} onChange={(e) => set("nav_contact_label", e.target.value)} />
            <Input label="Hizmetler Sayfası Başlık" value={settings.services_page_title || ""} onChange={(e) => set("services_page_title", e.target.value)} />
            <Input label="Hizmetler Sayfası Alt Başlık" value={settings.services_page_subtitle || ""} onChange={(e) => set("services_page_subtitle", e.target.value)} />
            <Input label="Hizmetler Bölümü Üst Metin" value={settings.services_section_eyebrow || ""} onChange={(e) => set("services_section_eyebrow", e.target.value)} />
            <Textarea
              label="Hizmetler Bölümü Başlık (Enter ile alt satır)"
              value={settings.services_section_title || ""}
              onChange={(e) => set("services_section_title", e.target.value)}
              className="min-h-[80px]"
            />
            <Input label="Hizmetler Bölümü Açıklama" value={settings.services_section_subtitle || ""} onChange={(e) => set("services_section_subtitle", e.target.value)} />
            <Input label="Galeri Sayfası Başlık" value={settings.gallery_page_title || ""} onChange={(e) => set("gallery_page_title", e.target.value)} />
            <Input label="Galeri Sayfası Alt Başlık" value={settings.gallery_page_subtitle || ""} onChange={(e) => set("gallery_page_subtitle", e.target.value)} />
            <Input label="Yorumlar Sayfası Başlık" value={settings.reviews_page_title || ""} onChange={(e) => set("reviews_page_title", e.target.value)} />
            <Input label="Yorumlar Sayfası Alt Başlık" value={settings.reviews_page_subtitle || ""} onChange={(e) => set("reviews_page_subtitle", e.target.value)} />
            <Input label="Hakkımızda Sayfası Başlık" value={settings.about_page_title || ""} onChange={(e) => set("about_page_title", e.target.value)} />
            <Input label="Hakkımızda Sayfası Alt Başlık" value={settings.about_page_subtitle || ""} onChange={(e) => set("about_page_subtitle", e.target.value)} />
            <Input label="İletişim Sayfası Başlık" value={settings.contact_page_title || ""} onChange={(e) => set("contact_page_title", e.target.value)} />
            <Input label="İletişim Sayfası Alt Başlık" value={settings.contact_page_subtitle || ""} onChange={(e) => set("contact_page_subtitle", e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Sayfa Banner Görselleri</h3>
          <p className="text-sm text-[#71717A] mb-6">Sayfa üst banner görsellerini dosyadan yükleyin.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ImageUpload
              label="Hizmetler Sayfası Banner"
              folder="banners"
              value={settings.services_page_banner || ""}
              onChange={(url) => set("services_page_banner", url)}
            />
            <ImageUpload
              label="Galeri Sayfası Banner"
              folder="banners"
              value={settings.gallery_page_banner || ""}
              onChange={(url) => set("gallery_page_banner", url)}
            />
            <ImageUpload
              label="Yorumlar Sayfası Banner"
              folder="banners"
              value={settings.reviews_page_banner || ""}
              onChange={(url) => set("reviews_page_banner", url)}
            />
            <ImageUpload
              label="Hakkımızda Sayfası Banner"
              folder="banners"
              value={settings.about_page_banner || ""}
              onChange={(url) => set("about_page_banner", url)}
            />
            <ImageUpload
              label="İletişim Sayfası Banner"
              folder="banners"
              value={settings.contact_page_banner || ""}
              onChange={(url) => set("contact_page_banner", url)}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#F8F8F8] mb-6">Telegram Gönderim Logları</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {logs.length === 0 && <p className="text-xs text-[#52525B]">Henüz log yok.</p>}
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-[#0D1117] rounded-xl border border-white/[0.06] text-xs">
                <div className="flex items-center gap-2 mb-1">
                  {log.status === "sent" ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className="text-[#F8F8F8] font-medium capitalize">{log.status}</span>
                  <span className="text-[#52525B]">·</span>
                  <span className="text-[#71717A]">{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
                </div>
                {log.status === "failed" && log.response && (
                  <p className="text-red-400/80 mt-1 pl-5">{log.response}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-4">
      <span className="text-sm text-[#71717A] shrink-0">{label}</span>
      <div className="sm:text-right sm:max-w-[60%] w-full sm:w-auto">{children}</div>
    </div>
  );
}
