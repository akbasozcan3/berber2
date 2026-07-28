"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Droplets, Crown } from "lucide-react";
import Link from "next/link";
import { api, type Service } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import SectionTitle from "@/components/ui/SectionTitle";

const ICONS = [Scissors, Sparkles, Droplets, Crown];

interface ServicesProps {
  showHeading?: boolean;
  theme?: "dark" | "light";
  initialServices?: Service[];
}

export default function Services({
  showHeading = true,
  theme = "dark",
  initialServices = [],
}: ServicesProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [loading, setLoading] = useState(initialServices.length === 0);
  const settings = usePublicSettings();
  const isLight = theme === "light";

  useEffect(() => {
    api
      .getServices()
      .then((data) => setServices(data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [initialServices]);

  return (
    <section
      id="services"
      className={`py-16 md:py-24 relative ${isLight ? "section-light border-b border-black/[0.06]" : "section-dark"}`}
    >
      {!isLight && <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />}

      <div className="max-w-7xl mx-auto px-6 lg:px-14 relative z-10">
        {showHeading && (
          <div className="mb-14 md:mb-20 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <span className={`w-8 h-px ${isLight ? "bg-black/25" : "bg-white/40"}`} />
              <p
                className={`text-[10px] font-bold tracking-[0.35em] uppercase ${
                  isLight ? "text-black/45" : "text-white/60"
                }`}
              >
                {settings.servicesSectionEyebrow}
              </p>
            </div>
            <SectionTitle
              title={settings.servicesSectionTitle}
              fallbackLine1="Özenle Tasarlanmış"
              fallbackLine2="Bakım Ritüelleri"
              className={`text-4xl md:text-6xl font-serif font-light tracking-tight mb-6 leading-[1.05] ${
                isLight ? "text-black" : "text-white"
              }`}
              line2ClassName={`italic font-light ${isLight ? "text-black/35" : "text-white/30"}`}
            />
            <p
              className={`text-base md:text-lg font-light leading-relaxed max-w-xl ${
                isLight ? "text-black/50" : "text-white/50"
              }`}
            >
              {settings.servicesSectionSubtitle}
            </p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`min-h-[320px] rounded-2xl border animate-pulse ${
                  isLight ? "bg-black/[0.04] border-black/[0.06]" : "bg-white/[0.03] border-white/[0.06]"
                }`}
              />
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <div
            className={`text-center py-20 rounded-2xl border ${
              isLight ? "border-black/10 bg-white" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <p className={isLight ? "text-black/50" : "text-white/50"}>
              Henüz online randevuya açık hizmet bulunmuyor. Bizi arayarak randevu alabilirsiniz.
            </p>
          </div>
        )}

        {!loading && services.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {services.map((service, index) => {
              const Icon = ICONS[index % ICONS.length];
              return (
                <motion.article
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`group relative flex flex-col min-h-[320px] border rounded-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                    isLight
                      ? `bg-white shadow-sm hover:shadow-md ${
                          service.popular ? "border-black/25" : "border-black/[0.1] hover:border-black/20"
                        }`
                      : `bg-[#121212]/60 backdrop-blur-sm hover:shadow-[0_20px_50px_rgba(255,255,255,0.06)] ${
                          service.popular ? "border-white/30" : "border-white/[0.08] hover:border-white/20"
                        }`
                  }`}
                >
                  {/* Hizmet görseli varsa göster */}
                  {service.image && (
                    <div className="relative h-44 w-full overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className={`absolute inset-0 ${isLight ? "bg-black/10" : "bg-black/30"}`} />
                    </div>
                  )}

                  <div className="flex flex-col flex-grow p-7 md:p-8">
                  {service.popular && (
                    <span
                      className={`absolute top-4 right-4 text-[8px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md ${
                        isLight ? "bg-black text-white" : "bg-white text-black"
                      }`}
                    >
                      Popüler
                    </span>
                  )}
                  <div className="mb-6">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-300 ${
                        isLight
                          ? "bg-black/[0.04] group-hover:bg-black/[0.08]"
                          : "bg-white/5 group-hover:bg-white/10"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={
                          isLight ? "text-black/55 group-hover:text-black" : "text-white/70 group-hover:text-white"
                        }
                      />
                    </div>
                  </div>

                  <h3
                    className={`text-xl font-serif font-light mb-3 pr-16 ${
                      isLight ? "text-black" : "text-white"
                    }`}
                  >
                    {service.name}
                  </h3>

                  <p
                    className={`text-sm font-light leading-relaxed flex-grow mb-8 line-clamp-3 ${
                      isLight ? "text-black/55" : "text-white/50"
                    }`}
                  >
                    {service.description}
                  </p>

                  <div
                    className={`pt-5 border-t flex justify-between items-end mt-auto ${
                      isLight ? "border-black/[0.08]" : "border-white/[0.08]"
                    }`}
                  >
                    <div>
                      <span
                        className={`block text-[9px] tracking-[0.2em] uppercase mb-1 ${
                          isLight ? "text-black/40" : "text-white/35"
                        }`}
                      >
                        Fiyat
                      </span>
                      <span className={`text-2xl font-serif font-light ${isLight ? "text-black" : "text-white"}`}>
                        ₺{service.price}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`block text-[9px] tracking-[0.2em] uppercase mb-1 ${
                          isLight ? "text-black/40" : "text-white/35"
                        }`}
                      >
                        Süre
                      </span>
                      <span className={`text-sm font-medium ${isLight ? "text-black/55" : "text-white/55"}`}>
                        {service.duration} dk
                      </span>
                    </div>
                  </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        <div className="flex justify-center mt-12 md:mt-16">
          <Link
            href="/randevu"
            className={`inline-flex items-center gap-3 px-10 md:px-12 py-4 md:py-5 rounded-full text-[10px] font-bold tracking-[0.28em] uppercase transition-all duration-300 ${
              isLight
                ? "bg-black text-white hover:bg-black/85"
                : "bg-white text-black hover:bg-white/90 shadow-[0_4px_24px_rgba(255,255,255,0.12)]"
            }`}
          >
            {settings.navCtaLabel || "Randevu Al"}
          </Link>
        </div>
      </div>
    </section>
  );
}
