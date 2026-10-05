"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Scissors, Calendar } from "lucide-react";
import WhatsAppIcon from "@/app/components/icons/WhatsAppIcon";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { toWhatsAppHref } from "@/lib/utils/format";
import { api, type Service } from "@/lib/api/client";
import { M_STUDIO_SERVICES } from "@/lib/data/services-fallback";

interface BookingCTAProps {
  initialServices?: Service[];
}

export default function BookingCTA({ initialServices = [] }: BookingCTAProps) {
  const settings = usePublicSettings();
  const [services, setServices] = useState<Service[]>(
    initialServices.length > 0 ? initialServices : M_STUDIO_SERVICES.slice(0, 4)
  );

  useEffect(() => {
    if (initialServices.length > 0) return;
    api
      .getServices()
      .then((list) => {
        if (list.length > 0) setServices(list.slice(0, 4));
      })
      .catch(() => {});
  }, [initialServices]);

  return (
    <section className="relative py-24 md:py-28 bg-[#0B1018] overflow-hidden border-t border-b border-white/[0.06] text-white">
      {/* Ambiyans Parlaması */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[350px] bg-[#C8703A]/10 rounded-full blur-[160px] pointer-events-none" />

      {settings.homeBookingCtaBanner ? (
        <Image
          src={settings.homeBookingCtaBanner}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-10"
          quality={78}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1018] via-[#0B1018]/95 to-[#0B1018]/80" />

      <div className="relative z-10 container mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#C8703A]" />
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-[#E5A869]">
                Canlı Koltuk Rezervasyonu
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-serif font-light text-white tracking-tight leading-[1.1]">
              Kişisel Tarzınız İçin <br />
              <span className="italic text-[#E5A869] font-normal">Koltuğunuz Hazır</span>
            </h2>

            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-xl">
              Zamanınız değerlidir. Sıra beklemeden, Mehmet İis ve ekibimizden dilediğiniz gün ve saatte
              yerinizi saniyeler içinde ayırtın.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/randevu"
                className="group inline-flex items-center justify-center gap-2.5 bg-white hover:bg-white/90 text-black px-8 py-4.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-[0_4px_25px_rgba(255,255,255,0.2)]"
              >
                <Calendar size={14} />
                <span>Hemen Randevu Al</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {settings.phone ? (
                <a
                  href={toWhatsAppHref(
                    settings.phone,
                    `Merhaba ${settings.businessName || "M Studio"}, randevu almak istiyorum.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 px-7 py-4.5 rounded-full text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-sm"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>WhatsApp ile Sor</span>
                </a>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="p-7 rounded-2xl bg-[#121926]/70 border border-white/[0.08] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5A869]">
                  Popüler Hizmetler & Fiyatlar
                </span>
                <Link href="/hizmetler" className="text-xs text-white/50 hover:text-white transition-colors">
                  Tümü →
                </Link>
              </div>

              <div className="space-y-3">
                {services.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#E5A869]">
                        <Scissors size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-[11px] text-white/40">{item.duration} dk seans</p>
                      </div>
                    </div>
                    <span className="font-serif text-lg font-bold text-white">₺{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
