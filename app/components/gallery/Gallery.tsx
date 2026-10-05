"use client";

import { useState, useEffect } from "react";
import { api, type GalleryImage } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import SectionTitle from "@/components/ui/SectionTitle";
import GalleryItemCard from "@/components/gallery/GalleryItemCard";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import { useGalleryLightbox } from "@/components/gallery/useGalleryLightbox";
import { isInstagramGalleryItem, isTikTokGalleryItem } from "@/lib/utils/gallery";
import InstagramIcon from "@/components/icons/InstagramIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";

interface GalleryProps {
  initialImages?: GalleryImage[];
}

export default function Gallery({ initialImages = [] }: GalleryProps) {
  const settings = usePublicSettings();
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [activeFilter, setActiveFilter] = useState<"all" | "reels" | "tiktok" | "photos">("all");

  useEffect(() => {
    if (initialImages.length > 0) return;
    api.getGallery().then(setImages).catch(() => setImages([]));
  }, [initialImages]);

  const filteredImages = images.filter((img) => {
    if (activeFilter === "reels") return img.mediaType === "instagram";
    if (activeFilter === "tiktok") return img.mediaType === "tiktok";
    if (activeFilter === "photos") return img.mediaType === "image" || !img.mediaType;
    return true;
  });

  const { lightboxImages, photoIndex, openLightbox, closeLightbox, goPrev, goNext } =
    useGalleryLightbox(filteredImages);

  const reelsCount = images.filter((i) => i.mediaType === "instagram").length;
  const tiktokCount = images.filter((i) => i.mediaType === "tiktok").length;
  const photosCount = images.filter((i) => i.mediaType === "image" || !i.mediaType).length;

  return (
    <section id="gallery" className="py-28 bg-[#080D15] relative min-h-screen">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      <div className="container mx-auto px-6 md:px-14">
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-5">
            <span className="w-8 h-[1px] bg-[#C8703A]" />
            <p className="text-[10px] font-bold tracking-[0.35em] text-[#C8703A] uppercase">
              {settings.homeGalleryEyebrow || "M Studio TV"}
            </p>
            <span className="w-8 h-[1px] bg-[#C8703A]" />
          </div>
          <SectionTitle
            title={settings.homeGalleryTitle}
            fallbackLine1="M Studio"
            fallbackLine2="Reels & Videolar"
            className="text-4xl md:text-6xl font-serif font-light tracking-tight text-white mb-6 leading-[1.1]"
            line2ClassName="italic text-[#E5A869] font-light"
          />
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            {settings.galleryPageSubtitle ||
              "Mehmet İis saç tasarımları, sakal geçişleri ve Instagram & TikTok paylaşımlarımız."}
          </p>

          {/* Social Quick Profile Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <a
              href="https://www.instagram.com/mstudiohairdresser/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#E1306C] text-white/80 hover:text-white text-xs font-medium transition-all"
            >
              <InstagramIcon size={14} className="text-[#E1306C]" />
              <span>@mstudiohairdresser Takip Et</span>
            </a>
            <a
              href="https://www.tiktok.com/@mehmetiis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#25F4EE] text-white/80 hover:text-white text-xs font-medium transition-all"
            >
              <TikTokIcon size={14} className="text-[#25F4EE]" />
              <span>@mehmetiis TikTok Takip Et</span>
            </a>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mb-14">
          {[
            { id: "all", label: `Tümü (${images.length})` },
            { id: "reels", label: `Instagram Reels (${reelsCount})` },
            { id: "tiktok", label: `TikTok Videoları (${tiktokCount})` },
            { id: "photos", label: `Fotoğraflar (${photosCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveFilter(tab.id as typeof activeFilter);
                closeLightbox();
              }}
              className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase transition-all duration-300 border ${
                activeFilter === tab.id
                  ? "bg-[#C8703A] text-white border-[#C8703A] shadow-[0_4px_16px_rgba(200,112,58,0.3)]"
                  : "bg-white/[0.03] text-white/60 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((item, index) => (
            <GalleryItemCard
              key={item.id}
              item={item}
              index={index}
              onClick={
                isInstagramGalleryItem(item) || isTikTokGalleryItem(item)
                  ? undefined
                  : () => openLightbox(item)
              }
            />
          ))}
        </div>
      </div>

      <GalleryLightbox
        images={lightboxImages}
        photoIndex={photoIndex}
        onClose={closeLightbox}
        onPrev={goPrev}
        onNext={goNext}
      />
    </section>
  );
}
