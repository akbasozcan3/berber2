"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, Scissors, Sparkles, ArrowRight } from "lucide-react";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import type { PageContent } from "@/lib/api/client";

const ICONS = [CalendarDays, Scissors, Sparkles];

const DEFAULT_STEPS = [
  {
    step: "01",
    title: "Randevu Seçin",
    desc: "Hizmet, usta ve uygun tarihinizi online rezervasyon sistemimizden saniyeler içinde belirleyin. Sıra bekleme yok.",
  },
  {
    step: "02",
    title: "Salona Gelin",
    desc: "Mehmet İis ile yüz anatomisine uygun stil konsültasyonu ve sıcak havlu kompresi ile ritüel başlasın.",
  },
  {
    step: "03",
    title: "Tarzınızı Yenileyin",
    desc: "Usta ellerle milimetrik saç kesimi, sakal heykeltıraşlığı ve organik bakım yağlarıyla stüdyomuzdan özgüvenle ayrılın.",
  },
];

type StepItem = {
  step: string;
  title: string;
  desc: string;
};

interface HowItWorksProps {
  initialPage?: PageContent | null;
}

export default function HowItWorks({ initialPage = null }: HowItWorksProps) {
  const { businessName, navCtaLabel } = usePublicSettings();

  const [eyebrow, setEyebrow] = useState(
    initialPage?.subtitle || "Salon Deneyim Yolculuğu"
  );
  const [title, setTitle] = useState(
    initialPage?.title || "3 Adımda Randevu & Kusursuz Deneyim"
  );
  const [intro, setIntro] = useState(
    initialPage?.content ||
      `${businessName || "M Studio"} deneyimi basit, hızlı ve konforlu. Randevunuzu alın, stilinizi ustalığımıza emanet edin.`
  );

  const initialSections = Array.isArray(initialPage?.sections) && initialPage.sections.length > 0
    ? (initialPage.sections as StepItem[])
    : DEFAULT_STEPS;

  const [steps, setSteps] = useState<StepItem[]>(initialSections);

  const initialCta =
    (initialPage?.meta as { ctaLabel?: string } | null)?.ctaLabel ||
    navCtaLabel ||
    "Hemen Randevu Al";
  const [ctaLabel, setCtaLabel] = useState(initialCta);

  useEffect(() => {
    if (initialPage) return;
    fetch("/api/v1/content?slug=home_how_it_works")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.subtitle) setEyebrow(data.subtitle);
        if (data.title) setTitle(data.title);
        if (data.content) setIntro(data.content);
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setSteps(data.sections as StepItem[]);
        }
        if (data.meta?.ctaLabel) setCtaLabel(data.meta.ctaLabel);
      })
      .catch(() => {});
  }, [initialPage]);

  return (
    <section className="py-24 md:py-32 bg-[#FAF9F6] relative border-y border-black/[0.08] text-neutral-900 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-14 max-w-7xl relative z-10">
        {/* Başlık ve Eyebrow — Badgesiz, Saf Lüks Tipografi */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-[#C8703A]" />
            <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-[#C8703A]">
              {eyebrow}
            </span>
            <span className="w-8 h-px bg-[#C8703A]" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-black tracking-tight leading-[1.12]">
            {title}
          </h2>

          <p className="mt-5 text-neutral-600 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            {intro}
          </p>
        </motion.div>

        {/* 3 Adım — Geniş, Ferah, Lüks Halka Tasarımı */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 relative">
          {steps.map((item, i) => {
            const Icon = ICONS[i] || Scissors;
            return (
              <motion.div
                key={item.step || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="relative text-center group"
              >
                {/* Masaüstünde adımları bağlayan zarif çizgi */}
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden md:block absolute top-14 left-[58%] w-[84%] h-px bg-gradient-to-r from-black/15 via-[#C8703A]/30 to-black/15 z-0 pointer-events-none"
                  />
                )}

                <div className="inline-flex flex-col items-center relative z-10 w-full">
                  <span className="text-[11px] font-mono font-bold tracking-[0.35em] text-[#C8703A] mb-5 uppercase">
                    ADIM {item.step}
                  </span>

                  {/* Büyük Lüks Halka İkon */}
                  <div className="w-28 h-28 rounded-full border border-black/10 bg-white flex items-center justify-center mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] group-hover:border-[#C8703A] group-hover:scale-105 group-hover:shadow-[0_16px_40px_rgba(200,112,58,0.18)] transition-all duration-500">
                    <div className="w-20 h-20 rounded-full border border-black/5 bg-[#FAF9F6] flex items-center justify-center group-hover:bg-[#C8703A]/10 transition-colors duration-500">
                      <Icon
                        size={28}
                        className="text-black/75 group-hover:text-[#C8703A] transition-colors duration-300"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-light text-black mb-3.5 tracking-tight group-hover:text-[#B5612E] transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="text-neutral-600 text-sm sm:text-base font-light leading-relaxed max-w-sm mx-auto">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Buton & Güven İmzası */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16 sm:mt-24"
        >
          <Link
            href="/randevu"
            className="inline-flex items-center gap-3 bg-black hover:bg-[#C8703A] text-white px-12 py-5 rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_35px_rgba(200,112,58,0.35)] group"
          >
            <span>{ctaLabel}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
          <p className="mt-4 text-xs text-neutral-600 font-light tracking-wide">
            Ortalama rezervasyon süresi: 45 saniye · Sıra beklemeden, Mehmet İis ustalığıyla
          </p>
        </motion.div>
      </div>
    </section>
  );
}
