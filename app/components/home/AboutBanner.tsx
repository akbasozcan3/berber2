"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { instagramUrl, tikTokUrl } from "@/lib/utils/format";

import type { PageContent } from "@/lib/api/client";

interface AboutBannerProps {
  initialPage?: PageContent | null;
}

export default function AboutBanner({ initialPage = null }: AboutBannerProps) {
  const settings = usePublicSettings();
  const insta = instagramUrl(settings.instagram);
  const tiktok = tikTokUrl(settings.tiktok);

  return (
    <section className="py-20 md:py-28 bg-[#0B1018] relative overflow-hidden border-b border-white/[0.06] text-white">
      {/* Ambiyans Işığı */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#C8703A]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-14 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Sol Kolon: Katmanlı Görsel Kompozisyonu */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative h-[440px] sm:h-[520px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
              <Image
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=85&w=1200&auto=format&fit=crop"
                alt="Mehmet İis · M Studio"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Sol Alt Rozet */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                <span className="text-[10px] text-[#E5A869] font-bold uppercase tracking-widest block mb-1">
                  Master Hairdresser & Kurucu
                </span>
                <p className="text-white text-lg font-serif">Mehmet İis</p>
                <p className="text-white/50 text-xs mt-1">
                  İstanbul Çekmeköy Taşdelen&apos;de erkek stilinin öncüsü.
                </p>
              </div>
            </div>

            {/* Sosyal Medya Floating Rozeti */}
            <div className="absolute -bottom-5 -right-3 sm:-right-6 bg-[#162032] border border-white/15 p-4 rounded-xl shadow-2xl flex items-center gap-3">
              <div className="flex -space-x-1.5">
                <a
                  href={insta}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-[#E1306C]"
                  title="Instagram"
                >
                  <InstagramIcon size={14} />
                </a>
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[#25F4EE]"
                  title="TikTok"
                >
                  <TikTokIcon size={14} />
                </a>
              </div>
              <div className="text-left pr-2">
                <span className="text-[11px] font-bold text-white block">@mehmetiis</span>
                <span className="text-[9px] text-[#E5A869] tracking-wider uppercase block">Reels & TikTok</span>
              </div>
            </div>
          </motion.div>

          {/* Sağ Kolon: Hikaye ve Felsefe */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-7 space-y-7"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C8703A]/15 border border-[#C8703A]/30 text-[#E5A869] text-[10px] font-bold uppercase tracking-[0.25em] mb-4">
                <Sparkles size={12} />
                <span>M Studio Hikayesi & Vizyonu</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-light text-white tracking-tight leading-tight">
                Tarzınızı Sıradanlıktan Çıkaran <br />
                <span className="italic text-[#E5A869] font-normal">Kişisel Bir Dokunuş</span>
              </h2>
            </div>

            <p className="text-white/60 text-base font-light leading-relaxed">
              M Studio Hairdresser, İstanbul Çekmeköy Taşdelen&apos;de Mehmet İis öncülüğünde erkek bakımında
              klasik zanaatı, çağdaş saç modasını ve konforu bir araya getiren bağımsız bir saç tasarım stüdyosudur.
            </p>

            <p className="text-white/60 text-base font-light leading-relaxed">
              Her müşterimizin saç dokusu, yüz anatomisi ve kişisel tarzı farklıdır. Bu yüzden fabrikasyon kesimler yerine;
              özene, milimetrik detaylara ve stüdyomuzdan ayrıldığınızda hissettiğiniz özgüvene odaklanıyoruz.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <CheckCircle2 size={16} className="text-[#E5A869] mb-2" />
                <h4 className="text-sm font-semibold text-white">Anatomik Kesim</h4>
                <p className="text-white/40 text-xs mt-1">Yüz hatlarınıza özel oranlar.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <CheckCircle2 size={16} className="text-[#E5A869] mb-2" />
                <h4 className="text-sm font-semibold text-white">Sakal Tasarımı</h4>
                <p className="text-white/40 text-xs mt-1">Sıcak havlu & ustura zanaatı.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <CheckCircle2 size={16} className="text-[#E5A869] mb-2" />
                <h4 className="text-sm font-semibold text-white">VIP Konfor</h4>
                <p className="text-white/40 text-xs mt-1">Beklemesiz randevulu hizmet.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/hakkimizda"
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] group"
              >
                <span>Hikayemizi Keşfedin</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/videolar"
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:border-white/50 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              >
                <span>Dönüşüm Videoları</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
