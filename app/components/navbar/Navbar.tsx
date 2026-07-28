"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { formatPhoneDisplay, formatWorkingHoursSummary, formatWorkingHoursTopbar, toTelHref } from "@/lib/utils/format";
import { splitBusinessNameForLogo, navbarLogoImageClass, mobileLogoImageClass } from "@/lib/utils/brand";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const settings = usePublicSettings();
  const logoUrl = settings.brandLogoUrl;
  const navLinks = [
    { name: settings.navServicesLabel, href: "/hizmetler" },
    { name: settings.navGalleryLabel, href: "/galeri" },
    { name: settings.navReviewsLabel, href: "/yorumlar" },
    { name: settings.navAboutLabel, href: "/hakkimizda" },
    { name: settings.navContactLabel, href: "/iletisim" },
  ];
  const phoneDisplay = formatPhoneDisplay(settings.phone);
  const hoursDisplay = formatWorkingHoursSummary(settings.workingHours);
  const topbarHoursDisplay = formatWorkingHoursTopbar(settings.workingHours);
  const logoText = splitBusinessNameForLogo(settings.businessName);

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
      alt={settings.businessName || "Salon"}
      className={navbarLogoImageClass}
      fetchPriority="high"
      decoding="async"
    />
  ) : (
    <div className="flex flex-col items-start justify-center">
      <span className="text-[13px] font-bold tracking-[0.18em] text-white uppercase group-hover:text-white/80 transition-colors duration-300 leading-tight">
        {logoText.primary}
      </span>
      {logoText.secondary ? (
        <span className="text-[9px] font-medium tracking-[0.22em] text-white/45 uppercase leading-tight mt-0.5">
          {logoText.secondary}
        </span>
      ) : null}
    </div>
  );

  const mobileBrandLogo = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={settings.businessName || "Salon"}
      className={mobileLogoImageClass}
      decoding="async"
    />
  ) : (
    brandLogo
  );

  return (
    <>
      {/* ─── HEADER CONTAINER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col w-full">
        
        {/* ─── 1. TOPBAR (Always Visible, Professional & Minimalist) ─── */}
        <div className="w-full bg-[#080D15] border-b border-white/[0.04] h-9 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 lg:px-10 flex items-center gap-3 text-white/50 text-[10px] font-semibold tracking-[0.12em] sm:tracking-[0.18em] uppercase">
            <a
              href={toTelHref(settings.phone)}
              className="flex items-center gap-1.5 hover:text-white transition-colors duration-300 shrink-0 whitespace-nowrap"
            >
              <Phone size={10} className="text-white/60 shrink-0" />
              <span>{phoneDisplay}</span>
            </a>

            {settings.locationShort ? (
              <span className="hidden md:inline-flex items-center gap-1.5 border-l border-white/10 pl-3 min-w-0 truncate">
                <MapPin size={10} className="text-white/60 shrink-0" />
                <span className="truncate">{settings.locationShort}</span>
              </span>
            ) : null}

            <div className="flex items-center gap-1.5 min-w-0 ml-auto">
              <Clock size={10} className="text-white/60 shrink-0" />
              <span className="truncate">{topbarHoursDisplay}</span>
            </div>
          </div>
        </div>

        {/* ─── 2. MAIN NAVBAR ─── */}
        <nav
          className={`w-full overflow-visible transition-all duration-300 ${
            scrolled
              ? "bg-[#0D1117]/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-3"
              : "bg-[#0D1117]/85 backdrop-blur-sm py-4.5"
          }`}
        >
          <div className="max-w-7xl mx-auto px-5 lg:px-10 h-20 flex items-center justify-between gap-6 overflow-visible">
            
            {/* Logo — large image, compact navbar row */}
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

            {/* Links - Centered */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-[11px] font-bold tracking-[0.18em] uppercase py-1 transition-colors duration-300 group ${
                    isActive(link.href) ? "text-white" : "text-white/45 hover:text-white"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[1.5px] bg-white transition-all duration-400 ${
                      isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <Link
                href="/randevu"
                className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-[#C8703A] hover:bg-[#B5612E] text-white rounded-sm text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 border border-[#C8703A]/50"
              >
                {settings.navCtaLabel || "Randevu Al"}
              </Link>

              {/* Mobile Burger Toggle */}
              <button
                className="lg:hidden text-white/70 hover:text-white transition-colors p-1"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menü"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ─── MOBILE DRAWER MENU ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={closeMobile}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0D1117] p-8 flex flex-col justify-between z-50 border-l border-white/[0.05]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top area */}
              <div className="space-y-12">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col min-h-10 justify-center">{mobileBrandLogo}</div>
                  <button onClick={closeMobile} className="text-white/60 hover:text-white p-1">
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeMobile}
                      className={`text-sm font-bold tracking-[0.15em] uppercase py-2 border-b border-white/[0.03] transition-colors ${
                        isActive(link.href) ? "text-white" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom area */}
              <div className="space-y-6 pt-8 border-t border-white/[0.05]">
                <Link
                  href="/randevu"
                  onClick={closeMobile}
                  className="w-full bg-white text-black text-center py-4 rounded-sm text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all block"
                >
                  {settings.navCtaLabel || "Randevu Al"}
                </Link>
                <div className="space-y-3 text-[11px] font-semibold text-white/40 tracking-wider uppercase">
                  <a href={toTelHref(settings.phone)} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone size={11} className="text-white/60" /> {phoneDisplay}
                  </a>
                  <div className="flex items-center gap-2">
                    <Clock size={11} className="text-white/60" /> {hoursDisplay}
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
