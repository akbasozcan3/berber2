"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarCheck, Compass, Sparkles, Check, ArrowRight } from "lucide-react";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";

const EXPERIENCE_STEPS = [
  {
    step: "01",
    title: "Dijital Rezervasyon",
    desc: "Online sistemimizden hizmetinizi, ustanızı ve uygun saatinizi saniyeler içinde belirleyin. Sıra bekleme yok.",
    icon: CalendarCheck,
  },
  {
    step: "02",
    title: "Stil Konsültasyonu",
    desc: "Mehmet İis ile yüz hatlarınıza, kemik anatomisine ve saç yapınıza en uygun saç & sakal modelini planlayın.",
    icon: Compass,
  },
  {
    step: "03",
    title: "Zanaat & Bakım Ritüeli",
    desc: "Sıcak havlu kompresi, steril ustura işçiliği, saç derisi masajı ve organik bakım yağlarıyla derin yenilenme.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Kusursuz İmzalı Tarz",
    desc: "Gün boyu bozulmayan mat dokulu profesyonel şekillendirme ve stüdyomuzdan yüksek özgüvenle ayrılış.",
    icon: Check,
  },
];

export default function HowItWorks() {
  const { navCtaLabel } = usePublicSettings();

  return (
    <section className="py-20 md:py-28 bg-[#FAF9F6] relative border-b border-black/[0.08] text-neutral-900">
      <div className="container mx-auto px-6 lg:px-14 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.04] border border-black/[0.08] text-[#C8703A] text-[10px] font-bold uppercase tracking-[0.25em] mb-4">
            <Sparkles size={12} />
            <span>Salon Deneyim Yolculuğu</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-light text-black tracking-tight leading-tight">
            M Studio Deneyimi <br />
            <span className="italic text-neutral-500 font-normal">Nasıl İşler?</span>
          </h2>
          <p className="mt-4 text-neutral-600 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            Geleneksel berberliği modern konforla birleştiren 4 adımlı özel servis protokolümüz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPERIENCE_STEPS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono font-bold text-[#C8703A] tracking-wider px-2.5 py-1 rounded-md bg-[#C8703A]/10">
                      ADIM {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-[#C8703A] group-hover:text-white transition-all duration-300">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-semibold text-black mb-3">
                    {item.title}
                  </h3>
                  <p className="text-neutral-600 text-sm font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono">0{i + 1} / 04</span>
                  <span className="group-hover:text-black transition-colors font-medium">Ayrıntılar</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-14 sm:mt-16">
          <Link
            href="/randevu"
            className="inline-flex items-center gap-2.5 bg-black hover:bg-neutral-800 text-white px-10 py-4.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,0,0,0.15)] group"
          >
            <span>{navCtaLabel || "Hemen Randevu Al"}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
