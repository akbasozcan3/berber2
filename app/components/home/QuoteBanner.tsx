"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, type PageContent } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";

interface QuoteBannerProps {
  initialPage?: PageContent | null;
}

export default function QuoteBanner({ initialPage = null }: QuoteBannerProps) {
  const { businessName, footerIntro } = usePublicSettings();
  const [page, setPage] = useState<PageContent | null>(initialPage);

  useEffect(() => {
    if (initialPage) return;
    api.getPageContent("home_quote").then(setPage).catch(() => {});
  }, [initialPage]);

  const meta = page?.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
    ? page.sections as { description?: string }
    : { description: "" };

  return (
    <section className="relative py-28 bg-[#0D1117] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
      {/* subtle accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C8703A]/[0.04] blur-[120px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className="w-12 h-px bg-white/30" />
              <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-white/40">{page?.title || "Felsefemiz"}</span>
              <span className="w-12 h-px bg-white/30" />
            </div>
            <blockquote className="text-3xl md:text-5xl lg:text-6xl font-serif font-light text-white leading-[1.2] tracking-tight mb-10">
              &ldquo;{page?.content || "Her kesim ve sakal tasarımı, tarzınızı yansıtan benzersiz bir imzadır."}&rdquo;
            </blockquote>
            <p className="text-white/45 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
              {meta.description || footerIntro || `${businessName} olarak modern tasarım tekniklerini geleneksel berberlik titizliğiyle harmanlıyoruz.`}
            </p>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.06]" />
    </section>
  );
}
