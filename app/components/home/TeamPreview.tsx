"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { api, type Barber } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";

interface TeamPreviewProps {
  initialBarbers?: Barber[];
}

export default function TeamPreview({ initialBarbers = [] }: TeamPreviewProps) {
  const settings = usePublicSettings();
  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);

  useEffect(() => {
    // Her zaman fresh veri çek — admin'de değişince sitede de güncel görünsün
    api.getBarbers().then(setBarbers).catch(() => {});
  }, []);

  if (barbers.length === 0) return null;

  return (
    <section className="py-28 bg-[#0D1117] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      <div className="container mx-auto px-6 lg:px-14">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-white" />
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-white/60">
                {settings.homeTeamEyebrow}
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-light text-white tracking-tight leading-tight">
              {settings.homeTeamTitle}
            </h2>
          </motion.div>
          <Link
            href="/randevu"
            className="group inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] uppercase text-white/40 hover:text-white transition-colors"
          >
            {settings.navCtaLabel || "Randevu Al"}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {barbers.slice(0, 3).map((barber, i) => (
            <motion.article
              key={barber.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141E2E] hover:border-[#C8703A]/40 transition-all duration-500"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {barber.avatar ? (
                  <Image
                    src={barber.avatar}
                    alt={barber.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-white/5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-1 mb-2 text-[#C8703A]/80">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-medium">{barber.performance ?? 95}% memnuniyet</span>
                  </div>
                  <h3 className="text-2xl font-serif font-light text-white">{barber.name}</h3>
                  <p className="text-white/60 text-xs tracking-[0.2em] uppercase mt-1">{barber.position}</p>
                  {barber.specialty && (
                    <p className="text-white/50 text-sm mt-3 font-light">{barber.specialty}</p>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
