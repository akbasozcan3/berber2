"use client";

import { motion } from "framer-motion";
import { Scissors, Sparkles, Video, ShieldCheck, Award, Star } from "lucide-react";
import Link from "next/link";

const CRAFT_PILLARS = [
  {
    icon: Scissors,
    title: "Anatomik Saç Kesimi",
    subtitle: "Mehmet İis Ustalığı",
    desc: "Yüz kemik yapısı ve saç çıkış yönüne göre milimetrik oranlarla tasarlanan modern ve klasik kesimler.",
    tag: "Kişiye Özel",
  },
  {
    icon: Sparkles,
    title: "Ustura & Sakal Zanaatı",
    subtitle: "Sıcak Havlu Ritüeli",
    desc: "Geleneksel ustura işçiliği, gözenekleri rahatlatan sıcak havlu kompresi ve doğal sakal yağı masajı.",
    tag: "Geleneksel",
  },
  {
    icon: Video,
    title: "M Studio TV & Trendler",
    subtitle: "TikTok & Reels Dönüşümleri",
    desc: "Mehmet İis'in sosyal medyada milyonlarca izlenen en güncel saç ve stil dönüşüm teknikleri.",
    tag: "@mehmetiis",
  },
  {
    icon: ShieldCheck,
    title: "VIP Hijyen & Konfor",
    subtitle: "Randevulu Tam Zamanında",
    desc: "Her misafir için tek kullanımlık steril uçlar, dünya standartlarında ürünler ve beklemesiz servis.",
    tag: "VIP Standart",
  },
];

export default function StatsStrip() {
  return (
    <section className="bg-[#0B1018] py-16 md:py-20 relative overflow-hidden border-b border-white/[0.06]">
      {/* Arka plan ışık vurgusu */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-[#C8703A]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        {/* Üst Vurgu Bandı */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 mb-12 border-b border-white/[0.08]">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8703A]/15 border border-[#C8703A]/30 text-[#E5A869] text-[10px] font-bold uppercase tracking-[0.25em]">
              <Award size={12} />
              <span>M Studio Hairdresser Felsefesi</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-white font-light tracking-tight mt-2">
              Erkek Bakımında <span className="italic text-[#E5A869] font-normal">Zanaat ve Estetik</span>
            </h3>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 text-white/70">
            <div className="text-center md:text-right">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-white block leading-none">
                12+
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mt-1">
                Yıl Deneyim
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center md:text-right">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#E5A869] flex items-center justify-center md:justify-end gap-1 leading-none">
                <Star size={18} className="fill-[#E5A869]" /> 4.9
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mt-1">
                Müşteri Puanı
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center md:text-right">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-white block leading-none">
                100%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mt-1">
                Steril Protokol
              </span>
            </div>
          </div>
        </div>

        {/* 4 Lüks Sütun Kartı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CRAFT_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl bg-[#121926]/60 border border-white/[0.08] hover:border-[#C8703A]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(200,112,58,0.12)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#E5A869] group-hover:bg-[#C8703A] group-hover:text-white transition-all duration-300">
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/[0.04] text-white/50 border border-white/[0.06]">
                      {pillar.tag}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5A869] block mb-1">
                    {pillar.subtitle}
                  </span>
                  <h4 className="text-lg font-serif font-medium text-white mb-3">
                    {pillar.title}
                  </h4>
                  <p className="text-white/50 text-xs font-light leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-white/30 font-mono">0{i + 1}</span>
                  <span className="text-white/40 group-hover:text-white transition-colors font-medium">
                    M Studio Zanaatı →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
