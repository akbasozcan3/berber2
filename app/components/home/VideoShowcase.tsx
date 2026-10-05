"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import InstagramIcon from "@/components/icons/InstagramIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { instagramUrl, tikTokUrl } from "@/lib/utils/format";
import type { GalleryImage } from "@/lib/api/client";

interface VideoItem {
  id: string;
  title: string;
  category: "fade" | "beard" | "styling" | "vip";
  platform: "instagram" | "tiktok";
  url: string;
  coverUrl: string;
  views: string;
  duration: string;
  description: string;
}

const SHOWCASE_VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    title: "Skin Fade & Quiff Kesimi",
    category: "fade",
    platform: "instagram",
    url: "https://www.instagram.com/mstudiohairdresser/",
    coverUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=1200&fit=crop",
    views: "185K",
    duration: "0:45",
    description: "Mehmet İis'ten kusursuz milimetrik skin fade geçişi ve tepe quiff şekillendirme sanatı.",
  },
  {
    id: "vid-2",
    title: "Sakal Heykeltıraşlığı & Ustura Çizgileri",
    category: "beard",
    platform: "tiktok",
    url: "https://www.tiktok.com/@mehmetiis",
    coverUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=1200&fit=crop",
    views: "240K",
    duration: "0:38",
    description: "Geleneksel ustura keskinliği, sıcak havlu kompresi ve organik yağlarla sakal çizgisi oluşturma.",
  },
  {
    id: "vid-3",
    title: "Dokulu İtalyan Saç Kesimi",
    category: "styling",
    platform: "instagram",
    url: "https://www.instagram.com/mstudiohairdresser/",
    coverUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=1200&fit=crop",
    views: "115K",
    duration: "0:52",
    description: "Modern katmanlı kesim, doğal hacim ve özel doku verici kil ile gün boyu bozulmayan stil.",
  },
  {
    id: "vid-4",
    title: "Sıcak Havlu & Kafa Masajı VIP",
    category: "vip",
    platform: "tiktok",
    url: "https://www.tiktok.com/@mehmetiis",
    coverUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=1200&fit=crop",
    views: "310K",
    duration: "1:05",
    description: "Yoğun bir günün ardından zihni ve cildi yenileyen M Studio imza aromaterapik VIP bakım ritüeli.",
  },
];

interface VideoShowcaseProps {
  initialGalleryItems?: GalleryImage[];
  isStandalonePage?: boolean;
}

export default function VideoShowcase({
  initialGalleryItems = [],
  isStandalonePage = false,
}: VideoShowcaseProps) {
  const settings = usePublicSettings();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const igUrl = instagramUrl(settings.instagram);
  const ttUrl = tikTokUrl(settings.tiktok);

  const dbVideos: VideoItem[] = (initialGalleryItems || [])
    .filter((g) => g.mediaType === "instagram" || g.mediaType === "tiktok" || g.isVideo)
    .map((g, idx) => ({
      id: `db-${g.id}`,
      title: g.title,
      category: (g.mediaType === "tiktok" ? "beard" : "styling") as VideoItem["category"],
      platform: (g.mediaType === "tiktok" ? "tiktok" : "instagram") as VideoItem["platform"],
      url: g.instagramUrl || (g.mediaType === "tiktok" ? ttUrl : igUrl),
      coverUrl: g.coverUrl || g.url,
      views: `${120 + ((idx * 47) % 230)}K`,
      duration: "0:45",
      description: g.title,
    }));

  const allVideos = dbVideos.length > 0 ? dbVideos : SHOWCASE_VIDEOS;

  const filteredVideos = allVideos.filter((v) => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "instagram") return v.platform === "instagram";
    if (categoryFilter === "tiktok") return v.platform === "tiktok";
    return v.category === categoryFilter;
  });

  const handleOpenVideo = (videoUrl: string) => {
    if (typeof window !== "undefined") {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="py-24 sm:py-28 bg-[#060910] relative overflow-hidden border-t border-b border-white/[0.06]">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C8703A]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[300px] bg-[#25F4EE]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#C8703A]" />
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-[#E5A869]">
                {settings.videosSectionEyebrow || "M Studio TV · Reels & Video"}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white tracking-tight leading-[1.1] whitespace-pre-line">
              {settings.videosSectionTitle || "Mehmet İis ile \nSaç Tasarım Sanatı"}
            </h2>
            <p className="text-white/60 text-base max-w-xl mt-4 font-light leading-relaxed">
              {settings.videosSectionSubtitle ||
                "Instagram ve TikTok sayfalarımızdan en popüler saç dönüşümleri, ustura geçişleri ve salon enerjisi."}
            </p>
          </div>

          {/* Social Follow Hub */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#833ab4]/15 via-[#fd1d1d]/15 to-[#fcb045]/15 border border-[#E1306C]/40 hover:border-[#E1306C] text-white hover:text-white transition-all shadow-[0_4px_16px_rgba(225,48,108,0.15)] group"
            >
              <InstagramIcon size={16} className="text-[#E1306C] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="block text-[9px] uppercase tracking-wider text-white/50 font-semibold">Instagram</span>
                <span className="text-xs font-bold text-white tracking-wide">@mstudiohairdresser</span>
              </div>
            </a>

            <a
              href={ttUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/60 border border-[#25F4EE]/40 hover:border-[#25F4EE] text-white hover:text-white transition-all shadow-[0_4px_16px_rgba(37,244,238,0.12)] group"
            >
              <TikTokIcon size={16} className="text-[#25F4EE] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="block text-[9px] uppercase tracking-wider text-white/50 font-semibold">TikTok</span>
                <span className="text-xs font-bold text-white tracking-wide">@mehmetiis</span>
              </div>
            </a>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {[
            { id: "all", label: "Tüm Videolar" },
            { id: "instagram", label: "Instagram Reels" },
            { id: "tiktok", label: "TikTok Videoları" },
            { id: "fade", label: "Skin Fade" },
            { id: "beard", label: "Sakal Tasarımı" },
            { id: "vip", label: "VIP Bakım" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.16em] uppercase transition-all duration-300 border ${
                categoryFilter === tab.id
                  ? "bg-[#C8703A] text-white border-[#C8703A] shadow-md shadow-[#C8703A]/25"
                  : "bg-white/[0.03] text-white/60 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVideos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06, duration: 0.4 }}
              className="group relative rounded-2xl overflow-hidden bg-[#0D131F] border border-white/[0.08] hover:border-[#C8703A]/60 transition-all duration-500 shadow-xl hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex flex-col cursor-pointer"
              onClick={() => handleOpenVideo(video.url)}
            >
              {/* Media Container (Vertical Phone Reel Aspect 9:13) */}
              <div className="relative aspect-[9/13] w-full overflow-hidden">
                {/* Background Poster Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-108"
                  style={{ backgroundImage: `url('${video.coverUrl}')` }}
                />

                {/* Ambient Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20 group-hover:from-black/95 transition-colors" />

                {/* Platform Badge (Top Left) */}
                <div className="absolute top-3.5 left-3.5 z-20">
                  {video.platform === "instagram" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/75 backdrop-blur-md text-white border border-[#E1306C]/40 shadow-md">
                      <InstagramIcon size={12} className="text-[#E1306C]" />
                      Reels
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/80 backdrop-blur-md text-white border border-[#25F4EE]/40 shadow-md">
                      <TikTokIcon size={11} className="text-[#25F4EE]" />
                      TikTok
                    </span>
                  )}
                </div>

                {/* Views Badge (Top Right) */}
                <div className="absolute top-3.5 right-3.5 z-20">
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-medium bg-black/70 backdrop-blur-md text-white/90 border border-white/10">
                    {video.views} izlenme
                  </span>
                </div>

                {/* Center Direct Play / Launch Button */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-2">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-115 group-hover:bg-[#C8703A] group-hover:border-[#C8703A] transition-all duration-300 shadow-2xl">
                    <Play size={22} fill="currentColor" className="ml-0.5" />
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 rounded-full bg-black/85 text-[10px] font-bold tracking-wider uppercase text-white border border-white/20 flex items-center gap-1">
                    <span>{video.platform === "tiktok" ? "TikTok'ta Oynat" : "Instagram'da Oynat"}</span>
                    <ExternalLink size={10} />
                  </span>
                </div>

                {/* Bottom Overlay Title & Subtitle */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                  <div className="flex items-center gap-1 text-[#E5A869] text-[10px] font-semibold tracking-wider uppercase mb-1">
                    <Sparkles size={11} />
                    <span>Mehmet İis</span>
                  </div>
                  <h3 className="text-lg font-serif font-light text-white leading-snug group-hover:text-[#E5A869] transition-colors">
                    {video.title}
                  </h3>
                </div>
              </div>

              {/* Card Footer with Direct Links */}
              <div className="p-4 bg-[#090E17] border-t border-white/[0.06] flex items-center justify-between gap-2">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5 transition-colors group-hover:text-[#E5A869]"
                >
                  <Play size={12} fill="currentColor" className="text-[#C8703A]" />
                  <span>Videoyu Oynat</span>
                </a>

                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-semibold text-white/60 hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/30"
                  title="Sosyal Medyada Aç"
                >
                  <span>{video.platform === "instagram" ? "Instagram" : "TikTok"}</span>
                  <ExternalLink size={11} className="text-[#C8703A]" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          {isStandalonePage ? (
            <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8703A]">
                Kişiye Özel Dönüşüm
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-light text-white">
                Videolardaki Saç & Sakal Tasarımını Deneyimleyin
              </h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Mehmet İis&apos;in usta dokunuşlarıyla tarzınızı baştan yaratmak için hemen yerinizi ayırtın.
              </p>
              <div className="pt-2">
                <Link
                  href="/randevu"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
                >
                  <span>Mehmet İis ile Randevu Al</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <Link
              href="/videolar"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#C8703A]/60 text-white text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300"
            >
              <span>Tüm Video & Reels Koleksiyonunu Gör</span>
              <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
