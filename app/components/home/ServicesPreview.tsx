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
    <section className="section-light py-24 relative overflow-hidden border-b border-black/[0.08]">
      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-black/30" />
              <span className="type-eyebrow-light">
                {settings.servicesSectionEyebrow || settings.navServicesLabel}
              </span>
            </div>
            <SectionTitle
              title={settings.servicesSectionTitle}
              fallbackLine1="Özenle Tasarlanmış"
              fallbackLine2="Bakım Ritüelleri"
              className="type-display-light text-4xl md:text-5xl lg:text-[3.35rem]"
              line2ClassName="type-display-light-accent"
            />
          </div>
          <Link href="/hizmetler" className="type-link-light group flex items-center gap-2 shrink-0">
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
                className={`group relative flex flex-col p-8 bg-white border rounded-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(0,0,0,0.09)] ${
                  s.popular ? "border-black/25 shadow-[0_8px_24px_rgba(0,0,0,0.04)]" : "border-black/[0.1]"
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-11 h-11 rounded-full border border-black/12 flex items-center justify-center text-neutral-600 group-hover:border-black group-hover:text-black transition-colors duration-500">
                    <Icon size={17} strokeWidth={1.75} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {s.popular && (
                      <span className="text-[8px] font-bold tracking-[0.25em] uppercase bg-black text-white px-2.5 py-1 rounded-sm">
                        Popüler
                      </span>
                    )}
                    <span className="type-index-light">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                </div>

                <h3 className="type-card-title-light mb-3">{s.name}</h3>
                <p className="type-body-light flex-grow mb-8">{s.description}</p>

                <div className="pt-5 border-t border-black/[0.1] flex justify-between items-end">
                  <div>
                    <span className="type-label-light block mb-1">Başlangıç</span>
                    <span className="type-price-light">₺{s.price}</span>
                  </div>
                  <span className="type-meta-light">{s.duration} dk</span>
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
