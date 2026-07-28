"use client";

import { useCallback, useState } from "react";
import type { GalleryImage } from "@/lib/api/client";
import { isInstagramGalleryItem } from "@/lib/utils/gallery";

export function useGalleryLightbox(images: GalleryImage[]) {
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  const lightboxImages = images.filter((img) => !isInstagramGalleryItem(img));

  const openLightbox = useCallback(
    (item: GalleryImage) => {
      if (isInstagramGalleryItem(item)) return;
      const index = lightboxImages.findIndex((img) => img.id === item.id);
      if (index >= 0) setPhotoIndex(index);
    },
    [lightboxImages]
  );

  const closeLightbox = useCallback(() => setPhotoIndex(null), []);

  const goPrev = useCallback(() => {
    setPhotoIndex((current) => {
      if (current === null || lightboxImages.length === 0) return current;
      return (current - 1 + lightboxImages.length) % lightboxImages.length;
    });
  }, [lightboxImages.length]);

  const goNext = useCallback(() => {
    setPhotoIndex((current) => {
      if (current === null || lightboxImages.length === 0) return current;
      return (current + 1) % lightboxImages.length;
    });
  }, [lightboxImages.length]);

  return {
    lightboxImages,
    photoIndex,
    openLightbox,
    closeLightbox,
    goPrev,
    goNext,
  };
}
