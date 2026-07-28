"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Scissors, Sparkles, Droplets, Crown, ArrowRight, Calendar } from "lucide-react";
import { api, type Service } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import SectionTitle from "@/components/ui/SectionTitle";

const ICONS = [Scissors, Sparkles, Droplets, Crown];

interface ServicesPreviewProps {
  initialServices?: Service[];
}

export default function ServicesPreview({ initialServices = [] }: ServicesPreviewProps) {
  const settings = usePublicSettings();
  const [services, setServices] = useState<Service[]>(initialServices);

  useEffect(() => {
    if (initialServices.length > 0) return;
    api.getServices().then((data) => setServices(data.slice(0, 4))).catch(() => {});
  }, [initialServices]);

  const display = services.slice(0, 4);

  return (
    <section className="py-24 relative overflow-hidden border-b border-black/[0.06]" style={{ backgroundColor: "#F5F2ED" }}>
      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-black/25" />
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-black/45">
                {settings.servicesSectionEyebrow || settings.navServicesLabel}
              </span>
            </div>
            <SectionTitle
              title={settings.servicesSectionTitle}
              fallbackLine1="Özenle Tasarlanmış"
              fallbackLine2="Bakım Ritüelleri"
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-black tracking-tight leading-[1.1]"
              line2ClassName="italic text-black/35 font-light"
            />
          </div>
          <Link
            href="/hizmetler"
            className="group flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-black/40 hover:text-black transition-colors shrink-0"
          >
            Tümünü Gör
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {display.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex flex-col p-8 bg-white border rounded-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] group ${
                  s.popular ? "border-black/30" : "border-black/[0.08]"
                }`}
              >
                {s.popular && (
                  <span className="absolute top-4 right-4 text-[8px] font-bold tracking-[0.25em] uppercase bg-black text-white px-2.5 py-1 rounded-sm">
                    Popüler
                  </span>
                )}

                <div className="flex items-start justify-between mb-8">
                  <div className="w-11 h-11 rounded-full border border-black/10 flex items-center justify-center text-black/50 group-hover:border-black group-hover:text-black transition-colors duration-500">
                    <Icon size={16} />
                  </div>
                </div>

                <h3 className="text-xl font-serif font-light text-black mb-3">{s.name}</h3>
                <p className="text-black/50 text-sm font-light leading-relaxed flex-grow mb-8 group-hover:text-black/65 transition-colors">
                  {s.description}
                </p>

                <div className="pt-5 border-t border-black/[0.08] flex justify-between items-end">
                  <div>
                    <span className="block text-[8px] tracking-[0.18em] uppercase text-black/35 mb-0.5">
                      Başlangıç
                    </span>
                    <span className="text-lg font-serif font-medium text-black">₺{s.price}</span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-xs font-light text-black/40">{s.duration} dk</span>
                    <span className="text-[11px] font-bold tracking-wider text-black/15 group-hover:text-black/30 transition-colors duration-500 font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center mt-14">
          <Link
            href="/randevu"
            className="group flex items-center gap-2.5 bg-[#1A2235] hover:bg-[#C8703A] text-white px-10 py-4 rounded-full text-[10px] font-bold tracking-[0.22em] uppercase transition-all duration-300 border border-white/10 hover:border-[#C8703A]"
          >
            <Calendar size={14} />
            {settings.navCtaLabel || "Randevu Al"}
          </Link>
        </div>
      </div>
    </section>
  );
}
