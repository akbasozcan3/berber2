"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CalendarCheck } from "lucide-react";
import { api, type HeroSlide } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";

const FALLBACK: HeroSlide[] = [
  {
    id: 1,
    title: "Kişisel Tarzınızın\nİmzası",
    subtitle: "M Studio Hairdresser · Mehmet İis",
    description: "İstanbul Çekmeköy Taşdelen'de usta ellerle saç ve sakal tasarımı. Sıra beklemeden randevunuzu oluşturun.",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=85&w=2560&auto=format&fit=crop",
    badge: "Master Hair Stylist",
    ctaText: "Randevu Al",
    ctaLink: "/randevu",
    sortOrder: 1,
    enabled: true,
  },
  {
    id: 2,
    title: "Sakal Heykeltıraşlığı &\nUstura Çizgileri",
    subtitle: "Geleneksel & Modern Zanaat",
    description: "Yüz hatlarınıza özel sakal tasarımı, sıcak havlu kompresi ve organik yağ bakımları ile kusursuz keskinlik.",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=85&w=2560&auto=format&fit=crop",
    badge: "Sakal & Bakım",
    ctaText: "Hizmetleri İncele",
    ctaLink: "/hizmetler",
    sortOrder: 2,
    enabled: true,
  },
  {
    id: 3,
    title: "M Studio TV\nReels & Videolar",
    subtitle: "Mehmet İis ile Trend Stiller",
    description: "TikTok ve Instagram'da milyonlarca izlenen saç kesim ve dönüşüm videolarımızı hemen keşfedin.",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=85&w=2560&auto=format&fit=crop",
    badge: "Reels & TikTok",
    ctaText: "Videoları İzle",
    ctaLink: "/videolar",
    sortOrder: 3,
    enabled: true,
  },
];

interface HeroSliderProps {
  initialSlides?: HeroSlide[];
}

export default function HeroSlider({ initialSlides = [] }: HeroSliderProps) {
  const { navServicesLabel, navCtaLabel } = usePublicSettings();
  const [slides, setSlides] = useState<HeroSlide[]>(
    initialSlides.length > 0 ? initialSlides : FALLBACK
  );
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (initialSlides.length > 0) return;
    api.getHeroSlides().then((data) => { if (data.length > 0) setSlides(data); }).catch(() => {});
  }, [initialSlides.length]);

  const next = useCallback(() => setCur((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCur((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!auto || slides.length <= 1) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [auto, next, slides.length]);

  const s = slides[cur];
  if (!s) return null;

  return (
    <section className="relative w-full" style={{ height: "100dvh", minHeight: 520 }}>
      <AnimatePresence mode="sync">
        <motion.div
          key={cur}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <Image
            src={s.image}
            alt={s.title.replace(/\s+/g, " ").trim()}
            fill
            priority={cur === 0}
            sizes="100vw"
            className="object-cover"
            quality={82}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
        <AnimatePresence mode="wait">
          <motion.div key={cur} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-3xl flex flex-col items-center">
            {s.subtitle && (
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-[#C8703A]" />
                <span className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#E5A869]">
                  {s.subtitle}
                </span>
                <span className="w-8 h-px bg-[#C8703A]" />
              </div>
            )}
            <h1 className="font-serif text-white leading-[1.08] mb-6 whitespace-pre-line text-4xl sm:text-6xl md:text-7xl font-light tracking-tight drop-shadow-xl">{s.title}</h1>
            <p className="text-white/70 text-base md:text-lg font-light leading-relaxed max-w-xl mb-8">{s.description}</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link href={s.ctaLink || "/randevu"} className="group flex items-center justify-center gap-2 bg-white hover:bg-[#C8703A] text-black hover:text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-[12px] sm:text-[13px] font-bold tracking-[0.18em] uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_25px_rgba(200,112,58,0.4)]">
                <CalendarCheck size={16} />{s.ctaText || navCtaLabel || "Randevu Al"}<ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/hizmetler" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-7 sm:px-10 py-4 sm:py-5 rounded-full text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase transition-colors">{navServicesLabel}</Link>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 hidden sm:flex">
          <button
            type="button"
            aria-label="Aşağı kaydır"
            onClick={() => {
              const next = document.querySelector("main > *:nth-child(2)") as HTMLElement | null;
              if (next) next.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-5 h-8 border border-white/25 rounded-full flex items-start justify-center pt-1.5 group-hover:border-white/50 transition-colors overflow-hidden">
              <span className="hero-scroll-dot block w-1 h-1.5 rounded-full bg-white/70" aria-hidden />
            </div>
            <span className="text-[9px] tracking-[0.25em] uppercase text-white/25 group-hover:text-white/50 transition-colors">Aşağı Kaydır</span>
          </button>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-5 lg:left-10 z-20 flex items-center gap-3">
          <button onClick={() => { setAuto(false); prev(); }} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-white/60 hover:text-white transition-all" aria-label="Önceki"><ArrowLeft size={14} /></button>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => { setAuto(false); setCur(i); }} className={`rounded-full transition-all duration-500 ${i === cur ? "w-7 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"}`} aria-label={`Slayt ${i + 1}`} />
            ))}
          </div>
          <button onClick={() => { setAuto(false); next(); }} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-white/60 hover:text-white transition-all" aria-label="Sonraki"><ArrowRight size={14} /></button>
        </div>
      )}
    </section>
  );
}
