"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import WhatsAppIcon from "@/app/components/icons/WhatsAppIcon";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { instagramUrl, formatPhoneDisplay, formatWorkingHoursSummary, toTelHref, toWhatsAppHref } from "@/lib/utils/format";
import { splitBusinessNameForLogo, siteLogoImageClass } from "@/lib/utils/brand";

export default function Footer() {
  const settings = usePublicSettings();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const insta = instagramUrl(settings.instagram);
  const phoneDisplay = formatPhoneDisplay(settings.phone);
  const hoursDisplay = formatWorkingHoursSummary(settings.workingHours);
  const logoText = splitBusinessNameForLogo(settings.businessName);

  return (
    <footer className="bg-[#080D15] pt-24 pb-12 border-t border-white/[0.06] relative z-10">
      <div className="container mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-6">
              {settings.brandLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.brandLogoUrl}
                  alt={settings.businessName || "Salon"}
                  className={siteLogoImageClass}
                />
              ) : (
                <>
                  <span className="text-2xl font-serif font-bold tracking-[0.15em] uppercase text-white hover:text-white/80 transition-colors duration-300">
                    {logoText.primary}
                  </span>
                  {logoText.secondary ? (
                    <span className="block text-xs font-serif italic font-light tracking-[0.1em] uppercase text-white/50 mt-1">
                      {logoText.secondary}
                    </span>
                  ) : null}
                </>
              )}
            </Link>
            <p className="text-white/40 font-light text-sm max-w-xs leading-relaxed">
              {settings.footerIntro}
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-white text-[9px] font-bold uppercase tracking-[0.28em] mb-6">
              Hızlı Menü
            </h4>
            <ul className="space-y-4">
              {[
                { label: settings.navServicesLabel, href: "/hizmetler" },
                { label: settings.navGalleryLabel, href: "/galeri" },
                { label: settings.navAboutLabel, href: "/hakkimizda" },
                { label: settings.navReviewsLabel, href: "/yorumlar" },
                { label: settings.navCtaLabel || "Randevu", href: "/randevu" },
                { label: settings.navContactLabel, href: "/iletisim" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/40 hover:text-white transition-colors text-sm font-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-[9px] font-bold uppercase tracking-[0.28em] mb-6">
              Yasal
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Gizlilik Politikası", href: "/gizlilik" },
                { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
                { label: "Çerez Politikası", href: "/cerez-politikasi" },
                { label: "KVKK Metni", href: "/kvkk" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/40 hover:text-white transition-colors text-sm font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-[9px] font-bold uppercase tracking-[0.28em] mb-6">
              İletişim
            </h4>
            <ul className="space-y-4 text-sm font-light text-white/40">
              {settings.phone ? (
                <li>
                  <a href={toTelHref(settings.phone)} className="hover:text-white transition-colors">
                    {phoneDisplay}
                  </a>
                </li>
              ) : null}
              {settings.address ? (
                <li className="leading-relaxed">{settings.address}</li>
              ) : null}
              <li>{hoursDisplay}</li>
              {settings.locationShort ? (
                <li className="text-white/30">{settings.locationShort}</li>
              ) : null}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white text-[9px] font-bold uppercase tracking-[0.28em] mb-6">
              Sosyal Medya
            </h4>
            <div className="flex flex-wrap gap-3">
              {settings.phone ? (
                <a
                  href={toWhatsAppHref(settings.phone, `Merhaba ${settings.businessName || "salon"}, bilgi almak istiyorum.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              ) : null}
              <a
                href={insta}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/90 hover:text-black hover:border-white/50 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
            <p className="text-white/30 text-xs mt-4">{settings.instagram}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <p className="text-white/30 text-xs mb-4 md:mb-0">
            {settings.footerCopyright ||
              `© ${new Date().getFullYear()} ${settings.businessName || "Salon"}. Tüm hakları saklıdır.`}
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2.5 text-white/35 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.25em] group"
          >
            Başa Dön
            <ArrowUp size={12} className="group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </footer>
  );
}
