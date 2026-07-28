"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/lib/api/client";
import { getGalleryDisplayUrl } from "@/lib/utils/gallery";

interface GalleryLightboxProps {
  images: GalleryImage[];
  photoIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function GalleryLightbox({
  images,
  photoIndex,
  onClose,
  onPrev,
  onNext,
}: GalleryLightboxProps) {
  const active = photoIndex !== null ? images[photoIndex] : null;

  return (
    <AnimatePresence>
      {active && photoIndex !== null ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 select-none"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
              aria-label="Önceki Görsel"
            >
              <ChevronLeft size={24} />
            </button>
          ) : null}

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[80vh] aspect-auto flex flex-col items-center"
          >
            <div className="relative w-[min(90vw,56rem)] h-[70vh] rounded-md overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={getGalleryDisplayUrl(active)}
                alt={active.title}
                fill
                sizes="90vw"
                className="object-contain"
                quality={90}
              />
            </div>
            <div className="mt-6 flex flex-col items-center text-center">
              <span className="text-[9px] tracking-[0.35em] text-white/60 uppercase font-bold">
                {active.title}
              </span>
              <span className="text-white/40 text-xs mt-1">
                Görsel {photoIndex + 1} / {images.length}
              </span>
            </div>
          </motion.div>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
              aria-label="Sonraki Görsel"
            >
              <ChevronRight size={24} />
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
