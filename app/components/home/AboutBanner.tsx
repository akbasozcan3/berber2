"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api, type PageContent } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { htmlToPlainPreview } from "@/lib/utils/html";

interface AboutBannerProps {
  initialPage?: PageContent | null;
}

export default function AboutBanner({ initialPage = null }: AboutBannerProps) {
  const { businessName } = usePublicSettings();
  const [page, setPage] = useState<PageContent | null>(initialPage);

  useEffect(() => {
    if (initialPage) return;
    api.getPageContent("about").then(setPage).catch(() => {});
  }, [initialPage]);

  const sections = Array.isArray(page?.sections) ? (page.sections as { title: string; desc: string }[]) : [];
  const previewText = page?.content ? htmlToPlainPreview(page.content) : "";
  const imageSrc =
    page?.heroImage || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop";

  return (
    <section className="relative py-0 bg-[#0D1117] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
        <div className="relative w-full h-full min-h-[400px] lg:min-h-[520px] overflow-hidden group">
          <Image
            src={imageSrc}
            alt={page?.title || businessName}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-[1.8s] group-hover:scale-105"
            quality={80}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col justify-center px-10 md:px-16 lg:px-20 py-12 md:py-16 bg-[#111827] text-white">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-white" />
            <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-white/60">{page?.subtitle || "Hakkımızda"}</span>
          </div>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-light text-white tracking-tight mb-8 leading-none whitespace-pre-line">{page?.title || businessName}</h2>
          <p className="text-white/60 text-base md:text-lg font-light leading-relaxed mb-12">{previewText}</p>
          {sections.length > 0 && (
            <div className="grid grid-cols-3 gap-8 py-8 border-y border-white/[0.08] mb-10">
              {sections.map((item, i) => (
                <div key={i}>
                  <p className="text-lg font-serif font-medium text-white mb-1">{item.title}</p>
                  <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
          <Link href="/hakkimizda" className="group self-start inline-flex items-center gap-3 border border-white/20 text-white hover:border-white/50 hover:text-white px-9 py-4 rounded-full text-[10px] font-bold tracking-[0.28em] uppercase transition-all duration-300">
            Detaylı Bilgi <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.06]" />
    </section>
  );
}
