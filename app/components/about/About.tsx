"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Scissors, Sparkles, ShieldCheck, Clock, Award, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { api, type PageContent } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { instagramUrl, tikTokUrl } from "@/lib/utils/format";

interface AboutProps {
  initialPage?: PageContent | null;
}

const DEFAULT_STORY_PARAGRAPHS = [
  "M Studio Hairdresser, İstanbul Çekmeköy Taşdelen merkezinde Master Stylist Mehmet İis öncülüğünde erkek saç tasarımını, sakal heykeltıraşlığını ve kişisel bakım ritüellerini en üst seviyeye taşımak amacıyla kurulmuştur.",
  "Bizim için saç kesimi sıradan bir berber rutini değil; kafa anatomisi, kemik yapısı, kıl yönü ve yaşam tarzınızın incelikle analiz edildiği bir sanat sürecidir. Mehmet İis'in 12 yılı aşkın tecrübesiyle her misafirimize özel bir imza stil kazandırıyoruz.",
  "Salonumuzda en yüksek medikal hijyen standartları uygulanmakta; her misafir için tek kullanımlık ustura bıçakları ve UV ile dezenfekte edilmiş ekipmanlar kullanılmaktadır. Randevulu çalışma sistemimiz sayesinde bekleme yapmadan, konforlu lounge alanımızda premium bir deneyim yaşarsınız.",
];

const CRAFTSMANSHIP_PILLARS = [
  {
    icon: Scissors,
    title: "Yüz Anatomisine Özel Tasarım",
    desc: "Her misafirimizin kafa yapısı ve saç çıkış yönüne göre milimetrik skin fade geçişleri ve kişiye özel formül.",
  },
  {
    icon: Sparkles,
    title: "Geleneksel Sakal Heykeltıraşlığı",
    desc: "Klasik ustura keskinliği, aromatik sıcak havlu kompresi ve organik yağlarla sakal hatlarının belirlenmesi.",
  },
  {
    icon: ShieldCheck,
    title: "%100 Medikal Hijyen Güvencesi",
    desc: "Tek kullanımlık bıçaklar, her işlem sonrası medikal dezenfektan ve UV sterilizasyon ile tavizsiz temizlik.",
  },
  {
    icon: Clock,
    title: "Zamanında VIP Randevu",
    desc: "Dakik hizmet prensibiyle sıra beklemeden koltuğunuza oturur, salonumuzda size ayrılan vaktin tadını çıkarırsınız.",
  },
];

export default function About({ initialPage = null }: AboutProps) {
  const [page, setPage] = useState<PageContent | null>(initialPage);
  const { businessName, locationShort, instagram, tiktok } = usePublicSettings();

  const igLink = instagramUrl(instagram);
  const ttLink = tikTokUrl(tiktok);

  useEffect(() => {
    if (initialPage) return;
    api.getPageContent("about").then(setPage).catch(() => {});
  }, [initialPage]);

  const imageSrc =
    page?.heroImage ||
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=85&w=1200&auto=format&fit=crop";

  return (
    <section id="about" className="relative py-24 sm:py-32 bg-[#080D15] overflow-hidden text-white">
      {/* Hairline subtle divider at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.08]" />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#C8703A]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-[#C8703A]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-14 relative z-10 max-w-7xl">
        {/* ─── 1. BÖLÜM: BİYOGRAFİ & GÖRSEL ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start mb-24">
          {/* Sol: Fotoğraf & Master Stylist Rozeti */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true, margin: "-80px" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative h-[540px] sm:h-[620px] rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl group">
              <Image
                src={imageSrc}
                alt="Mehmet İis - M Studio Hairdresser"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080D15] via-transparent to-black/20" />

              {/* Sol Üst: Master Rozeti */}
              <div className="absolute top-5 left-5 z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-bold tracking-[0.2em] uppercase text-[#E5A869] shadow-lg">
                  <Award size={12} />
                  <span>Master Hair Stylist</span>
                </span>
              </div>

              {/* Alt Bilgi Kartı */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-[#0B1019]/85 backdrop-blur-md border border-white/[0.08] z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-light text-white leading-tight">Mehmet İis</h3>
                    <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#C8703A] mt-0.5">
                      Kurucu & Baş Stilist
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 bg-white/[0.05] px-2.5 py-1 rounded-md border border-white/10">
                    <Star size={13} fill="currentColor" />
                    <span className="text-xs font-bold text-white">4.9</span>
                  </div>
                </div>
                {locationShort ? (
                  <p className="text-white/50 text-xs mt-2 pt-2 border-t border-white/[0.06]">
                    📍 {locationShort}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* Sağ: Metin & Hikaye */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            viewport={{ once: true, margin: "-80px" }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#C8703A]" />
              <p className="text-[10px] font-bold tracking-[0.35em] text-[#C8703A] uppercase">
                {page?.subtitle || "Zanaat, Tutku & Kusursuzluk"}
              </p>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-white leading-[1.08]">
              {page?.title || "Mehmet İis ile \nM Studio Felsefesi"}
            </h2>

            {/* İçerik Yazısı */}
            {page?.content ? (
              <div
                className="prose prose-invert prose-lg max-w-none text-white/60 font-light leading-relaxed space-y-4
                  [&_h3]:text-white [&_h3]:font-serif [&_h3]:text-2xl [&_h3]:mt-8 [&_h3]:mb-3
                  [&_p]:mb-4 [&_ul]:space-y-2 [&_li]:text-white/60 [&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <div className="space-y-4 text-white/60 text-base font-light leading-relaxed">
                {DEFAULT_STORY_PARAGRAPHS.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {/* Sosyal Medya Profilleri */}
            <div className="pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-4">
              <span className="text-xs text-white/40 font-medium">Bizi Takip Edin:</span>
              <a
                href={igLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#E1306C] text-xs font-semibold text-white/80 hover:text-white transition-all group"
              >
                <InstagramIcon size={13} className="text-[#E1306C]" />
                <span>@mstudiohairdresser</span>
              </a>
              <a
                href={ttLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#25F4EE] text-xs font-semibold text-white/80 hover:text-white transition-all group"
              >
                <TikTokIcon size={13} className="text-[#25F4EE]" />
                <span>@mehmetiis</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* ─── 2. BÖLÜM: 4 ANA ZANAAT DİREĞİ (HAIRLINE KARTLAR) ─── */}
        <div className="mb-24">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="w-8 h-px bg-[#C8703A]" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8703A]">
                Standartlarımız
              </span>
              <span className="w-8 h-px bg-[#C8703A]" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif font-light text-white">
              Neden M Studio Hairdresser?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CRAFTSMANSHIP_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-[#0D131F] border border-white/[0.08] hover:border-[#C8703A]/50 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:-translate-y-1"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#E5A869] group-hover:bg-[#C8703A] group-hover:text-white transition-all duration-300 mb-6">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-mono text-white/30 block mb-2">0{idx + 1}</span>
                    <h4 className="text-lg font-serif font-medium text-white mb-3">
                      {pillar.title}
                    </h4>
                    <p className="text-xs text-white/55 font-light leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] text-[#C8703A] font-semibold tracking-wider uppercase">
                    <CheckCircle2 size={12} />
                    <span>M Studio Standardı</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 3. BÖLÜM: SAYISAL GÖSTERGELER & İNCE ÇİZGİLER ─── */}
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-[#0C121D] via-[#101726] to-[#0C121D] border border-white/[0.08] shadow-2xl mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            <div className="flex flex-col items-center pt-4 lg:pt-0">
              <span className="text-4xl sm:text-5xl font-serif font-light text-white">12+</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E5A869] mt-2">
                Yıllık Zanaat
              </span>
              <span className="text-xs text-white/40 mt-1 font-light">Mehmet İis Deneyimi</span>
            </div>

            <div className="flex flex-col items-center pt-4 lg:pt-0">
              <span className="text-4xl sm:text-5xl font-serif font-light text-white">4.9</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E5A869] mt-2">
                Google Puanı
              </span>
              <span className="text-xs text-white/40 mt-1 font-light">Taşdelen'in En İyisi</span>
            </div>

            <div className="flex flex-col items-center pt-4 lg:pt-0">
              <span className="text-4xl sm:text-5xl font-serif font-light text-white">15K+</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E5A869] mt-2">
                Mutlu Misafir
              </span>
              <span className="text-xs text-white/40 mt-1 font-light">Sadık Müşteri Ağı</span>
            </div>

            <div className="flex flex-col items-center pt-4 lg:pt-0">
              <span className="text-4xl sm:text-5xl font-serif font-light text-white">%100</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E5A869] mt-2">
                Sterilizasyon
              </span>
              <span className="text-xs text-white/40 mt-1 font-light">Medikal Hijyen</span>
            </div>
          </div>
        </div>

        {/* ─── 4. BÖLÜM: RANDEVU ÇAĞRISI BANNER ─── */}
        <div className="text-center py-12 px-6 rounded-2xl border border-white/[0.08] bg-[#0A0E17] relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-5">
            <h3 className="text-3xl sm:text-4xl font-serif font-light text-white">
              Tarzınızı Master Dokunuşla Yenileyin
            </h3>
            <p className="text-white/60 text-sm font-light leading-relaxed">
              Mehmet İis ve ekibinin titiz işçiliğiyle tanışmak için hemen online randevunuzu oluşturun.
            </p>
            <div className="pt-2">
              <Link
                href="/randevu"
                className="inline-flex items-center gap-2.5 bg-white hover:bg-neutral-200 text-black px-9 py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-[0_4px_25px_rgba(255,255,255,0.2)]"
              >
                <span>Hemen Randevu Al</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
