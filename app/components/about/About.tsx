"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { api, type PageContent } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";

interface AboutProps {
  initialPage?: PageContent | null;
}

export default function About({ initialPage = null }: AboutProps) {
  const [page, setPage] = useState<PageContent | null>(initialPage);
  const { businessName, locationShort } = usePublicSettings();

  useEffect(() => {
    if (initialPage) return;
    api.getPageContent("about").then(setPage).catch(() => {});
  }, [initialPage]);

  const sections = Array.isArray(page?.sections) ? page.sections as { title: string; desc: string }[] : [
    { title: "Zanaat", desc: "Özenli İşçilik" },
    { title: "Konfor", desc: "Rahat Deneyim" },
    { title: "Hijyen", desc: "Temiz Standart" },
  ];
  const imageSrc =
    page?.heroImage || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop";

  return (
    <section id="about" className="relative py-32 bg-black overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/8" />
      <div className="container mx-auto px-6 md:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1.1 }} viewport={{ once: true, margin: "-80px" }}
            className="relative h-[620px] rounded-2xl overflow-hidden border border-white/10 group lg:sticky lg:top-32">
            <Image
              src={imageSrc}
              alt={page?.title || businessName}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
              quality={80}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 z-10">
              <p className="text-2xl font-serif font-light text-white">{businessName}</p>
              {locationShort ? (
                <p className="text-white/60 font-bold tracking-[0.28em] uppercase text-[9px] mt-1.5">{locationShort}</p>
              ) : null}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, delay: 0.15 }} viewport={{ once: true, margin: "-80px" }}>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-[1px] bg-white" />
              <p className="text-[10px] font-bold tracking-[0.35em] text-white/60 uppercase">{page?.subtitle || "Hakkımızda & Hikayemiz"}</p>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white mb-10 leading-[1.05]">{page?.title || businessName}</h2>

            <div className="prose prose-invert prose-lg max-w-none text-white/55 font-light leading-relaxed space-y-4
              [&_h3]:text-white [&_h3]:font-serif [&_h3]:text-2xl [&_h3]:mt-10 [&_h3]:mb-4
              [&_p]:mb-4 [&_ul]:space-y-2 [&_li]:text-white/50 [&_strong]:text-white/80"
              dangerouslySetInnerHTML={{ __html: page?.content || "<p>Yükleniyor...</p>" }} />

            <div className="grid grid-cols-3 gap-8 pt-10 mt-10 border-t border-white/[0.08]">
              {sections.map((stat, index) => (
                <div key={index} className="flex flex-col">
                  <span className="text-2xl font-serif font-medium text-white mb-2">{stat.title}</span>
                  <span className="text-[9px] text-white/35 font-bold uppercase tracking-[0.2em]">{stat.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
