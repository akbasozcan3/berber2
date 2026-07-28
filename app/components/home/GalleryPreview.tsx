"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api, type GalleryImage } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import SectionTitle from "@/components/ui/SectionTitle";
import { instagramUrl } from "@/lib/utils/format";
import { isInstagramGalleryItem } from "@/lib/utils/gallery";
import GalleryItemCard from "@/components/gallery/GalleryItemCard";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import { useGalleryLightbox } from "@/components/gallery/useGalleryLightbox";

interface GalleryPreviewProps {
  initialImages?: GalleryImage[];
}

export default function GalleryPreview({ initialImages = [] }: GalleryPreviewProps) {
  const settings = usePublicSettings();
  const [images, setImages] = useState<GalleryImage[]>(initialImages.slice(0, 6));

  const { lightboxImages, photoIndex, openLightbox, closeLightbox, goPrev, goNext } =
    useGalleryLightbox(images);

  const ctaHref =
    settings.homeGalleryCtaUrl?.trim() || instagramUrl(settings.instagram);
  const ctaLabel = settings.homeGalleryCtaLabel || "Instagram'da Gör";

  useEffect(() => {
    if (initialImages.length > 0) return;
    api.getGallery().then((data) => setImages(data.slice(0, 6))).catch(() => {});
  }, [initialImages]);

  return (
    <section className="py-28 bg-[#0D1117] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div className="container mx-auto px-6 lg:px-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px bg-white" />
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-white/60">
                {settings.homeGalleryEyebrow || settings.navGalleryLabel}
              </span>
            </div>
            <SectionTitle
              title={settings.homeGalleryTitle}
              fallbackLine1={settings.businessName}
              fallbackLine2="Instagram"
              className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white leading-[1.05]"
              line2ClassName="italic text-white/25"
            />
          </div>
          <Link
            href={ctaHref}
            target={ctaHref.startsWith("http") ? "_blank" : undefined}
            rel={ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-white/35 hover:text-white transition-colors shrink-0"
          >
            {ctaLabel}
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((item, i) => (
            <GalleryItemCard
              key={item.id}
              item={item}
              index={i}
              onClick={isInstagramGalleryItem(item) ? undefined : () => openLightbox(item)}
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
