"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  ExternalLink,
  Navigation,
} from "lucide-react";
import WhatsAppIcon from "@/app/components/icons/WhatsAppIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import { api } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import {
  formatPhoneDisplay,
  formatWorkingHoursSummary,
  googleMapsEmbedUrl,
  instagramUrl,
  tikTokUrl,
  toTelHref,
  toWhatsAppHref,
} from "@/lib/utils/format";

interface ContactProps {
  showHeading?: boolean;
}

export default function Contact({ showHeading = true }: ContactProps) {
  const settings = usePublicSettings();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const phoneDisplay = formatPhoneDisplay(settings.phone);
  const hoursDisplay = formatWorkingHoursSummary(settings.workingHours);
  const email = settings.contactEmail;
  const mapEmbed = googleMapsEmbedUrl(settings.googleMaps, settings.address);

  const contactItems = [
    ...(settings.phone
      ? [
          {
            icon: Phone,
            title: "Telefon",
            detail: phoneDisplay,
            action: "Hemen Ara",
            href: toTelHref(settings.phone),
          },
          {
            icon: WhatsAppIcon,
            title: "WhatsApp",
            detail: phoneDisplay,
            action: "WhatsApp ile Yaz",
            href: toWhatsAppHref(
              settings.phone,
              `Merhaba ${settings.businessName || "salon"}, bilgi almak istiyorum.`
            ),
            external: true,
          },
        ]
      : []),
    {
      icon: Mail,
      title: "E-posta",
      detail: email,
      action: "E-posta Yaz",
      href: `mailto:${email}`,
    },
    {
      icon: MapPin,
      title: "Adres",
      detail: settings.address,
      action: "Haritada Aç",
      href: settings.googleMaps,
      external: true,
    },
    {
      icon: Clock,
      title: "Çalışma Saatleri",
      detail: hoursDisplay,
      action: "",
      href: "",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.submitContact(form);
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mesaj gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-black relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        {showHeading && (
          <div className="mb-16 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-[#C8703A]" />
              <p className="text-[10px] font-bold tracking-[0.35em] text-[#C8703A] uppercase">
                {settings.contactPageTitle}
              </p>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-white leading-[1.05] mb-5">
              {settings.contactPageTitle}
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              {settings.contactIntro}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-14">
          <div className="xl:col-span-5 space-y-3">
            {contactItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group flex items-start gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:border-white/30 transition-colors">
                    <Icon size={18} className="text-white/50 group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[9px] font-bold tracking-[0.25em] text-white/35 uppercase mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white text-sm font-light leading-relaxed">{item.detail}</p>
                    {item.action && item.href && (
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors mt-2"
                      >
                        {item.external ? <ExternalLink size={11} /> : <Navigation size={11} />}
                        {item.action}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {settings.instagram && (
              <a
                href={instagramUrl(settings.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:border-[#E1306C]/40 transition-all group"
              >
                <div className="w-11 h-11 rounded-full border border-white/20 bg-gradient-to-tr from-[#833ab4]/30 to-[#fd1d1d]/30 flex items-center justify-center text-[#E1306C] group-hover:scale-105 transition-transform">
                  <InstagramIcon size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.25em] text-[#E1306C]/70 uppercase mb-1">
                    Instagram
                  </p>
                  <p className="text-white text-sm font-medium">@mstudiohairdresser</p>
                </div>
              </a>
            )}

            {settings.tiktok && (
              <a
                href={tikTokUrl(settings.tiktok)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:border-[#25F4EE]/40 transition-all group"
              >
                <div className="w-11 h-11 rounded-full border border-white/20 bg-black/60 flex items-center justify-center text-[#25F4EE] group-hover:scale-105 transition-transform">
                  <TikTokIcon size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.25em] text-[#25F4EE]/70 uppercase mb-1">
                    TikTok
                  </p>
                  <p className="text-white text-sm font-medium">@mehmetiis</p>
                </div>
              </a>
            )}
          </div>

          <div className="xl:col-span-7 space-y-6">
            <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-white/[0.08] relative">
              <iframe
                title={`${settings.businessName} Konum`}
                src={mapEmbed}
                className="absolute inset-0 w-full h-full border-0 grayscale-[30%] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={settings.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-2.5 rounded-full transition-colors"
              >
                <MapPin size={12} />
                Haritada Aç
              </a>
            </div>

            <div className="border border-white/[0.08] p-8 md:p-10 rounded-2xl bg-white/[0.02]">
              <h3 className="text-xl font-serif font-light text-white mb-6">Hızlı Mesaj</h3>
              {sent && (
                <div className="mb-6 p-4 bg-white/5 border border-white/15 rounded-xl flex items-center gap-3 text-white/60 text-sm">
                  <CheckCircle size={18} />
                  Mesajınız başarıyla gönderildi!
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] block mb-2">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Adınız Soyadınız"
                      className="w-full bg-transparent border-b border-white/15 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#C8703A] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] block mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="eposta@domain.com"
                      className="w-full bg-transparent border-b border-white/15 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#C8703A] transition-colors text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] block mb-2">
                    Mesaj
                  </label>
                  <textarea
                    rows={4}
                    required
                    minLength={10}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Mesajınız..."
                    className="w-full bg-transparent border-b border-white/15 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#C8703A] transition-colors resize-none text-sm"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-[#C8703A] hover:text-white py-4 rounded-full font-bold text-[10px] tracking-[0.28em] uppercase transition-all duration-300 disabled:opacity-50 shadow-[0_4px_16px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_20px_rgba(200,112,58,0.35)]"
                >
                  {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
