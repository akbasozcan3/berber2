"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Clock, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import InstagramIcon from "@/components/icons/InstagramIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import WhatsAppIcon from "@/app/components/icons/WhatsAppIcon";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import {
  formatPhoneDisplay,
  formatWorkingHoursSummary,
  formatWorkingHoursTopbar,
  toTelHref,
  toWhatsAppHref,
  instagramUrl,
  tikTokUrl,
} from "@/lib/utils/format";
import { splitBusinessNameForLogo, navbarLogoImageClass, mobileLogoImageClass } from "@/lib/utils/brand";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const settings = usePublicSettings();
  const logoUrl = settings.brandLogoUrl;

  const navLinks = [
    { name: settings.navServicesLabel || "Hizmetler", href: "/hizmetler" },
    { name: "Videolar & Reels", href: "/videolar" },
    { name: settings.navGalleryLabel || "Galeri", href: "/galeri" },
    { name: settings.navReviewsLabel || "Yorumlar", href: "/yorumlar" },
    { name: settings.navAboutLabel || "Hakkımızda", href: "/hakkimizda" },
    { name: settings.navContactLabel || "İletişim", href: "/iletisim" },
  ];

  const phoneDisplay = formatPhoneDisplay(settings.phone);
  const hoursDisplay = formatWorkingHoursSummary(settings.workingHours);
  const topbarHoursDisplay = formatWorkingHoursTopbar(settings.workingHours);
  const logoText = splitBusinessNameForLogo(settings.businessName || "M Studio Hairdresser");
  const igLink = instagramUrl(settings.instagram);
  const ttLink = tikTokUrl(settings.tiktok);

  useEffect(() => {
    void Promise.resolve().then(() => setMobileOpen(false));
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const closeMobile = () => setMobileOpen(false);
  const isActive = (href: string) => pathname === href;

  const brandLogo = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={settings.businessName || "M Studio Hairdresser"}
      className={navbarLogoImageClass}
      fetchPriority="high"
      decoding="async"
    />
  ) : (
    <div className="flex flex-col items-start justify-center">
      <div className="flex items-center gap-1.5">
        <span className="text-[14px] sm:text-[15px] font-serif font-bold tracking-[0.18em] text-black uppercase group-hover:text-[#B5612E] transition-colors duration-300 leading-tight">
          {logoText.primary || "M STUDIO"}
        </span>
      </div>
      <span className="text-[9px] font-semibold tracking-[0.24em] text-neutral-500 uppercase leading-tight mt-0.5">
        {logoText.secondary || "HAIRDRESSER"}
      </span>
    </div>
  );

  const mobileBrandLogo = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={settings.businessName || "M Studio Hairdresser"}
      className={mobileLogoImageClass}
      decoding="async"
    />
  ) : (
    <div className="flex flex-col items-start justify-center">
      <span className="text-[16px] font-serif font-bold tracking-[0.18em] text-white uppercase leading-tight">
        {logoText.primary || "M STUDIO"}
      </span>
      <span className="text-[10px] font-medium tracking-[0.22em] text-[#C8703A] uppercase leading-tight mt-0.5">
        {logoText.secondary || "HAIRDRESSER"}
      </span>
    </div>
  );

  return (
    <>
      {/* ─── HEADER CONTAINER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col w-full">
        {/* ─── 1. TOPBAR (Always Visible, Sleek Luxury Dark Strip) ─── */}
        <div className="w-full bg-[#080D15] border-b border-white/[0.06] h-9 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 lg:px-10 flex items-center gap-4 text-white/60 text-[10px] font-semibold tracking-[0.12em] sm:tracking-[0.18em] uppercase">
            <a
              href={toTelHref(settings.phone)}
              className="flex items-center gap-1.5 hover:text-white transition-colors duration-300 shrink-0 whitespace-nowrap"
            >
              <Phone size={10} className="text-[#C8703A] shrink-0" />
              <span>{phoneDisplay}</span>
            </a>

            {settings.locationShort ? (
              <span className="hidden md:inline-flex items-center gap-1.5 border-l border-white/10 pl-3 min-w-0 truncate">
                <MapPin size={10} className="text-[#C8703A] shrink-0" />
                <span className="truncate">{settings.locationShort}</span>
              </span>
            ) : null}

            {/* Social Links in Topbar */}
            <div className="flex items-center gap-2.5 ml-auto">
              <a
                href={igLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-white/50 hover:text-white transition-colors"
                title="Instagram @mstudiohairdresser"
              >
                <InstagramIcon size={12} className="text-[#E1306C]" />
                <span className="hidden sm:inline text-[9px] tracking-wider font-normal lowercase">@mstudiohairdresser</span>
              </a>

              <span className="text-white/20 hidden sm:inline">·</span>

              <a
                href={ttLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-white/50 hover:text-white transition-colors"
                title="TikTok @mehmetiis"
              >
                <TikTokIcon size={12} className="text-[#25F4EE]" />
                <span className="hidden sm:inline text-[9px] tracking-wider font-normal lowercase">@mehmetiis</span>
              </a>

              <span className="text-white/20 hidden md:inline">·</span>

              <div className="hidden md:flex items-center gap-1.5 min-w-0 text-white/40">
                <Clock size={10} className="text-white/50 shrink-0" />
                <span className="truncate">{topbarHoursDisplay}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. MAIN NAVBAR ─── */}
        <nav
          className={`w-full overflow-visible transition-all duration-300 ${
            scrolled
              ? "bg-white/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.12)] py-2.5"
              : "bg-white/90 backdrop-blur-md py-4 border-b border-black/[0.05]"
          }`}
        >
          <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-6 overflow-visible">
            {/* Logo */}
            <Link
              href="/"
              className={`shrink-0 overflow-visible group ${
                logoUrl
                  ? "flex items-center shrink-0"
                  : "flex flex-col items-start min-h-10 justify-center"
              }`}
            >
              {brandLogo}
            </Link>

            {/* Links - Desktop */}
            <div className="hidden lg:flex items-center gap-8 xl:gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-[11px] font-bold tracking-[0.18em] uppercase py-1 transition-colors duration-300 group ${
                    isActive(link.href)
                      ? "text-[#C8703A]"
                      : "text-black/70 hover:text-black"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[2px] bg-[#C8703A] transition-all duration-300 ${
                      isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* CTA Button & Mobile Toggle */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/randevu"
                className="group relative hidden sm:inline-flex items-center justify-center gap-2.5
                  min-w-[136px] md:min-w-[155px] h-10 md:h-11 px-5 md:px-6
                  bg-[#0A0E17] hover:bg-[#B5612E]
                  text-white
                  border border-white/10 hover:border-[#C8703A]
                  rounded-full
                  text-[10px] md:text-[11px] font-bold tracking-[0.18em] uppercase
                  transition-all duration-300 ease-out
                  hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(200,112,58,0.45)]
                  active:translate-y-0 shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
              >
                <span className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors duration-300">
                  <Calendar size={12} className="text-[#E5A869] group-hover:text-white transition-colors duration-300 shrink-0" strokeWidth={2.2} />
                </span>
                <span className="transition-colors duration-300">{settings.navCtaLabel || "Randevu Al"}</span>
              </Link>

              {/* Mobile Burger Toggle */}
              <button
                className="lg:hidden flex items-center justify-center
                  w-10 h-10
                  text-black hover:text-[#C8703A]
                  hover:bg-black/[0.05]
                  rounded-full
                  transition-all duration-300"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menü"
              >
                {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ─── MOBILE DRAWER MENU ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md lg:hidden"
            onClick={closeMobile}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="absolute right-0 top-0 bottom-0 w-84 max-w-[88vw] bg-[#0A0E17] text-white p-7 flex flex-col justify-between z-50 border-l border-white/[0.08] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top area */}
              <div className="space-y-8">
                <div className="flex justify-between items-center pb-4 border-b border-white/[0.08]">
                  <div className="flex flex-col justify-center">{mobileBrandLogo}</div>
                  <button
                    onClick={closeMobile}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeMobile}
                      className={`text-[13px] font-bold tracking-[0.16em] uppercase py-3 px-3 rounded-lg transition-colors duration-200 ${
                        isActive(link.href)
                          ? "bg-[#C8703A]/20 text-[#E5A869] border border-[#C8703A]/30"
                          : "text-white/70 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {/* Social Channels in Mobile Menu */}
                <div className="pt-4 border-t border-white/[0.08] space-y-3">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                    Sosyal Medyada Biz
                  </p>
                  <div className="flex gap-2.5">
                    <a
                      href={igLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 border border-white/10 text-white/90 hover:text-white text-xs font-medium"
                    >
                      <InstagramIcon size={14} className="text-[#E1306C]" />
                      <span>Instagram</span>
                    </a>

                    <a
                      href={ttLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#000000] border border-[#25F4EE]/30 text-white/90 hover:text-white text-xs font-medium"
                    >
                      <TikTokIcon size={14} className="text-[#25F4EE]" />
                      <span>TikTok</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom area */}
              <div className="space-y-4 pt-6 border-t border-white/[0.08]">
                <Link
                  href="/randevu"
                  onClick={closeMobile}
                  className="w-full flex items-center justify-center gap-2.5
                    bg-gradient-to-r from-[#C8703A] to-[#B5612E] hover:from-[#B5612E] hover:to-[#9E4E20]
                    text-white
                    text-center
                    py-3.5
                    rounded-full
                    text-[11px]
                    font-bold
                    tracking-[0.18em]
                    uppercase
                    transition-all
                    duration-300
                    shadow-[0_4px_16px_rgba(200,112,58,0.4)]"
                >
                  <Calendar size={14} className="text-white shrink-0" strokeWidth={2.2} />
                  <span>{settings.navCtaLabel || "Hemen Randevu Al"}</span>
                </Link>

                <div className="space-y-2.5 text-[11px] font-medium text-white/60 tracking-wider">
                  <a
                    href={toTelHref(settings.phone)}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <Phone size={12} className="text-[#C8703A]" />
                    <span>{phoneDisplay}</span>
                  </a>

                  {settings.phone ? (
                    <a
                      href={toWhatsAppHref(settings.phone, "Merhaba M Studio, bilgi ve randevu almak istiyorum.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#25D366] hover:text-[#25D366]/80 transition-colors"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>WhatsApp Destek</span>
                    </a>
                  ) : null}

                  <div className="flex items-center gap-2 text-white/50 text-[10px]">
                    <Clock size={12} className="text-white/40" />
                    <span>{hoursDisplay}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
