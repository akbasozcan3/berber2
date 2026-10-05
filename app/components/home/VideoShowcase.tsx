"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, X, ExternalLink, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import InstagramIcon from "@/components/icons/InstagramIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { instagramUrl, tikTokUrl } from "@/lib/utils/format";

interface VideoItem {
  id: string;
  title: string;
  category: "fade" | "beard" | "styling" | "vip";
  platform: "instagram" | "tiktok";
  url: string;
  coverUrl: string;
  videoSrc?: string;
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
    videoSrc: "https://videos.pexels.com/video-files/3998188/3998188-uhd_2560_1440_30fps.mp4",
    views: "185K",
    duration: "0:45",
    description: "Mehmet İis'ten kusursuz milimetrik skin fade geçişi ve tepe quiff şekillendirme sanatı.",
  },
  {
    id: "vid-2",
    title: "Sakal Heykeltıraşlığı & Ustura",
    category: "beard",
    platform: "tiktok",
    url: "https://www.tiktok.com/@mehmetiis",
    coverUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=1200&fit=crop",
    videoSrc: "https://videos.pexels.com/video-files/3998188/3998188-uhd_2560_1440_30fps.mp4",
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
    videoSrc: "https://videos.pexels.com/video-files/3998188/3998188-uhd_2560_1440_30fps.mp4",
    views: "115K",
    duration: "0:52",
    description: "Modern katmanlı kesim, doğal hacim ve özel doku verici kil ile gün boyu bozulmayan stil.",
  },
  {
    id: "vid-4",
    title: "Sıcak Havlu & Kafa Masajı",
    category: "vip",
    platform: "tiktok",
    url: "https://www.tiktok.com/@mehmetiis",
    coverUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=1200&fit=crop",
    videoSrc: "https://videos.pexels.com/video-files/3998188/3998188-uhd_2560_1440_30fps.mp4",
    views: "310K",
    duration: "1:05",
    description: "Yoğun bir günün ardından zihni ve cildi yenileyen M Studio imza aromaterapik VIP bakım ritüeli.",
  },
];

export default function VideoShowcase() {
  const settings = usePublicSettings();
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const igUrl = instagramUrl(settings.instagram);
  const ttUrl = tikTokUrl(settings.tiktok);

  const filteredVideos = SHOWCASE_VIDEOS.filter((v) => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "instagram") return v.platform === "instagram";
    if (categoryFilter === "tiktok") return v.platform === "tiktok";
    return v.category === categoryFilter;
  });

  return (
    <section className="py-28 bg-[#060910] relative overflow-hidden border-t border-b border-white/[0.06]">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C8703A]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[300px] bg-[#25F4EE]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#C8703A]" />
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-[#E5A869]">
                M Studio TV · Reels & Video
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white tracking-tight leading-[1.1]">
              Mehmet İis ile <br />
              <span className="italic text-[#E5A869] font-normal">Saç Tasarım Sanatı</span>
            </h2>
            <p className="text-white/60 text-base max-w-xl mt-4 font-light leading-relaxed">
              Instagram ve TikTok sayfalarımızdan en popüler saç dönüşümleri, ustura geçişleri ve salon enerjisi.
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
        <div className="flex flex-wrap items-center gap-2 mb-12">
          {[
            { id: "all", label: "Tüm Videolar" },
            { id: "instagram", label: "Instagram Reels" },
            { id: "tiktok", label: "TikTok Trendleri" },
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
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="group relative rounded-2xl overflow-hidden bg-[#0D131F] border border-white/[0.08] hover:border-[#C8703A]/50 transition-all duration-500 shadow-xl hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col"
            >
              {/* Media Container (Vertical Phone Reel Aspect 9:14) */}
              <div
                className="relative aspect-[9/13] w-full overflow-hidden cursor-pointer"
                onClick={() => setActiveVideo(video)}
              >
                {/* Background Poster Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${video.coverUrl}')` }}
                />

                {/* Ambient Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20 group-hover:from-black/90 transition-colors" />

                {/* Platform Badge (Top Left) */}
                <div className="absolute top-3.5 left-3.5 z-20">
                  {video.platform === "instagram" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/70 backdrop-blur-md text-white border border-[#E1306C]/40 shadow-md">
                      <InstagramIcon size={12} className="text-[#E1306C]" />
                      Reel
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/75 backdrop-blur-md text-white border border-[#25F4EE]/40 shadow-md">
                      <TikTokIcon size={11} className="text-[#25F4EE]" />
                      TikTok
                    </span>
                  )}
                </div>

                {/* Views & Duration Badge (Top Right) */}
                <div className="absolute top-3.5 right-3.5 z-20">
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-medium bg-black/70 backdrop-blur-md text-white/80 border border-white/10">
                    {video.views} izlenme
                  </span>
                </div>

                {/* Center Animated Play Button */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-115 group-hover:bg-[#C8703A] group-hover:border-[#C8703A] transition-all duration-300 shadow-2xl">
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  </div>
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
                <button
                  type="button"
                  onClick={() => setActiveVideo(video)}
                  className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Play size={12} fill="currentColor" className="text-[#C8703A]" />
                  <span>Videoyu Oynat</span>
                </button>

                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-white/50 hover:text-[#E5A869] flex items-center gap-1 transition-colors"
                  title="Sosyal Medyada Aç"
                >
                  <span>{video.platform === "instagram" ? "Instagram" : "TikTok"}</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA to View All & Follow */}
        <div className="mt-16 text-center">
          <Link
            href="/galeri"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#C8703A]/60 text-white text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300"
          >
            <span>Tüm Galeri ve Videoları İncele</span>
            <ExternalLink size={13} className="text-[#C8703A]" />
          </Link>
        </div>
      </div>

      {/* Video Modal Player */}
      <AnimatePresence>
        {activeVideo && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg bg-[#0A0E17] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#070B12]">
                <div className="flex items-center gap-2.5">
                  {activeVideo.platform === "instagram" ? (
                    <InstagramIcon size={16} className="text-[#E1306C]" />
                  ) : (
                    <TikTokIcon size={15} className="text-[#25F4EE]" />
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-tight">
                      {activeVideo.title}
                    </h4>
                    <span className="text-[10px] text-white/50 tracking-wider">
                      Mehmet İis · {activeVideo.platform === "instagram" ? "@mstudiohairdresser" : "@mehmetiis"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                  >
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label="Kapat"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="relative aspect-[9/14] max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
                <video
                  src={activeVideo.videoSrc}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Modal Description & Actions */}
              <div className="p-5 bg-[#090E17] border-t border-white/10 space-y-4">
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  {activeVideo.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href="/randevu"
                    onClick={() => setActiveVideo(null)}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#C8703A] hover:bg-[#B5612E] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-[#C8703A]/30"
                  >
                    <Calendar size={14} />
                    <span>Bu Stili İstiyorum - Randevu Al</span>
                  </Link>

                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium transition-colors"
                  >
                    <span>{activeVideo.platform === "instagram" ? "Instagram'da Takip Et" : "TikTok'ta Takip Et"}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
