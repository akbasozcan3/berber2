"use client";

import { motion } from "framer-motion";
import { CirclePlay } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import type { GalleryImage } from "@/lib/api/client";
import {
  getGalleryDisplayUrl,
  getGalleryItemLink,
  isInstagramGalleryItem,
  isTikTokGalleryItem,
} from "@/lib/utils/gallery";

interface GalleryItemCardProps {
  item: GalleryImage;
  index?: number;
  onClick?: () => void;
  className?: string;
  aspectClassName?: string;
}

export default function GalleryItemCard({
  item,
  index = 0,
  onClick,
  className = "",
  aspectClassName = "aspect-square md:aspect-[4/3]",
}: GalleryItemCardProps) {
  const displayUrl = getGalleryDisplayUrl(item);
  const externalLink = getGalleryItemLink(item);
  const isInstagram = isInstagramGalleryItem(item);
  const isTikTok = isTikTokGalleryItem(item);
  const showVideoBadge = item.isVideo || isTikTok;

  const inner = (
    <>
      {displayUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          style={{ backgroundImage: `url('${displayUrl}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#141A24] flex items-center justify-center">
          {isTikTok ? (
            <TikTokIcon size={32} className="text-[#25F4EE]/40" />
          ) : (
            <InstagramIcon size={32} className="text-white/20" />
          )}
        </div>
      )}

      {showVideoBadge && (
        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center pointer-events-none shadow-lg">
          <CirclePlay size={16} className="text-white fill-white/20" />
        </div>
      )}

      {isInstagram && (
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1.5 pointer-events-none">
          <InstagramIcon size={12} className="text-[#E1306C]" />
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/80">
            {item.isVideo ? "Reel" : "Post"}
          </span>
        </div>
      )}

      {isTikTok && (
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#25F4EE]/30 flex items-center gap-1.5 pointer-events-none">
          <TikTokIcon size={11} className="text-[#25F4EE]" />
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white">
            TikTok
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col items-center justify-end p-6 text-center gap-2">
        <span className="text-[9px] tracking-[0.3em] uppercase text-[#E5A869] font-semibold transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
          {item.title}
        </span>
        <span className="text-white font-serif italic text-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400 delay-75">
          {isTikTok ? "TikTok'ta İzle →" : isInstagram ? "Instagram'da Aç →" : "Detaylı İncele"}
        </span>
      </div>
    </>
  );

  const motionProps = {
    initial: { opacity: 0, scale: 0.97 } as const,
    animate: { opacity: 1, scale: 1 } as const,
    transition: { delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    className: `relative overflow-hidden group bg-[#101622] backdrop-blur-sm border border-white/[0.08] hover:border-[#C8703A]/50 rounded-xl cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 ${aspectClassName} ${className}`,
  };

  if (externalLink) {
    return (
      <motion.a
        href={externalLink}
        target="_blank"
        rel="noopener noreferrer"
        {...motionProps}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.div {...motionProps} onClick={onClick} role={onClick ? "button" : undefined}>
      {inner}
    </motion.div>
  );
}
