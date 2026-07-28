"use client";

import { useState, useEffect } from "react";
import { api, type GalleryImage } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import SectionTitle from "@/components/ui/SectionTitle";
import GalleryItemCard from "@/components/gallery/GalleryItemCard";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import { useGalleryLightbox } from "@/components/gallery/useGalleryLightbox";
import { isInstagramGalleryItem } from "@/lib/utils/gallery";

interface GalleryProps {
  initialImages?: GalleryImage[];
}

export default function Gallery({ initialImages = [] }: GalleryProps) {
  const settings = usePublicSettings();
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [activeCategory, setActiveCategory] = useState("Tümü");

  useEffect(() => {
    if (initialImages.length > 0) return;
    api.getGallery().then(setImages).catch(() => setImages([]));
  }, [initialImages]);

  const categories = ["Tümü", ...Array.from(new Set(images.map((img) => img.title)))];

  const filteredImages = images.filter(
    (img) => activeCategory === "Tümü" || img.title === activeCategory
  );

  const { lightboxImages, photoIndex, openLightbox, closeLightbox, goPrev, goNext } =
    useGalleryLightbox(filteredImages);

  return (
    <section id="gallery" className="py-32 bg-[#0D1117] relative min-h-screen">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      <div className="container mx-auto px-6 md:px-16">
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 h-[1px] bg-white" />
            <p className="text-[10px] font-bold tracking-[0.35em] text-white/60 uppercase">
              {settings.homeGalleryEyebrow || settings.galleryPageTitle}
            </p>
            <span className="w-8 h-[1px] bg-white" />
          </div>
          <SectionTitle
            title={settings.homeGalleryTitle}
            fallbackLine1={settings.businessName}
            fallbackLine2="Instagram"
            className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white mb-6 leading-[1.05]"
            line2ClassName="italic text-white/40 font-light"
          />
          <p className="text-white/50 text-lg max-w-xl mx-auto font-light leading-relaxed">
            {settings.galleryPageSubtitle}
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  closeLightbox();
                }}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 border ${
                  activeCategory === cat
                    ? "bg-white text-black border-white shadow-[0_4px_16px_rgba(255,255,255,0.1)]"
                    : "bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((item, index) => (
            <GalleryItemCard
              key={item.id}
              item={item}
              index={index}
              onClick={isInstagramGalleryItem(item) ? undefined : () => openLightbox(item)}
              className="bg-black"
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
