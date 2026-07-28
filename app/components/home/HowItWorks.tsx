"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, Scissors, Sparkles } from "lucide-react";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";

const ICONS = [CalendarDays, Scissors, Sparkles];

const DEFAULT_STEPS = [
  {
    step: "01",
    title: "Randevu Seçin",
    desc: "Hizmet, berber, tarih ve saati online olarak birkaç tıkla belirleyin.",
  },
  {
    step: "02",
    title: "Salona Gelin",
    desc: "Sıra beklemeden, seçtiğiniz saatte profesyonel ekibimiz sizi karşılasın.",
  },
  {
    step: "03",
    title: "Tarzınızı Yenileyin",
    desc: "Kişiye özel kesim ve bakımla salonumuzdan özgüvenle ayrılın.",
  },
];

type Step = { step: string; title: string; desc: string };

export default function HowItWorks() {
  const { businessName, navCtaLabel } = usePublicSettings();
  const [eyebrow, setEyebrow] = useState("Nasıl Çalışır?");
  const [title, setTitle] = useState("3 Adımda Randevu");
  const [intro, setIntro] = useState(
    `${businessName} deneyimi basit, hızlı ve konforlu. Randevunuzu alın, gerisini bize bırakın.`
  );
  const [steps, setSteps] = useState<Step[]>(DEFAULT_STEPS);
  const [ctaLabel, setCtaLabel] = useState(navCtaLabel || "Randevu Al");

  useEffect(() => {
    fetch("/api/v1/content?slug=home_how_it_works")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.subtitle) setEyebrow(data.subtitle);
        if (data.title) setTitle(data.title);
        if (data.content) setIntro(data.content);
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setSteps(data.sections);
        }
        if (data.meta?.ctaLabel) setCtaLabel(data.meta.ctaLabel);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="section-light py-28 relative border-y border-black/[0.08]">
      <div className="container mx-auto px-6 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-black/25" />
            <span className="type-eyebrow-light">{eyebrow}</span>
            <span className="w-8 h-px bg-black/25" />
          </div>
          <h2 className="type-display-light text-4xl md:text-5xl">{title}</h2>
          <p className="mt-5 type-body-light max-w-2xl mx-auto">{intro}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item, i) => {
            const Icon = ICONS[i] || CalendarDays;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="relative text-center group"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-black/10" />
                )}
                <div className="inline-flex flex-col items-center">
                  <span className="text-[10px] font-bold tracking-[0.35em] text-[#C8703A] mb-4">
                    {item.step}
                  </span>
                  <div className="w-24 h-24 rounded-full border border-black/12 flex items-center justify-center mb-8 group-hover:border-black group-hover:bg-black/[0.03] transition-all duration-500">
                    <Icon size={28} strokeWidth={1.5} className="text-neutral-600 group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="type-card-title-light mb-3">{item.title}</h3>
                  <p className="type-body-light text-sm max-w-xs">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            href="/randevu"
            className="inline-flex items-center gap-3 bg-[#1A2235] text-white hover:bg-[#C8703A] px-10 py-4 rounded-full text-[10px] font-bold tracking-[0.28em] uppercase transition-all duration-300 border border-white/10 hover:border-[#C8703A]"
          >
            {navCtaLabel || ctaLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
