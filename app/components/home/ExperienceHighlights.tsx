"use client";

import { motion } from "framer-motion";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import SectionTitle from "@/components/ui/SectionTitle";

export default function ExperienceHighlights() {
  const {
    businessName,
    googleRating,
    googleReviewCount,
    experienceEyebrow,
    experienceTitle,
    experienceYears,
    experienceHygiene,
  } = usePublicSettings();

  const highlights = [
    { value: `${googleRating}`, label: "Google Puanı", suffix: "/ 5" },
    { value: googleReviewCount, label: "Mutlu Müşteri", suffix: "+" },
    { value: experienceYears, label: "Yıllık Deneyim", suffix: "" },
    { value: experienceHygiene, label: "Hijyen Standardı", suffix: "" },
  ];

  return (
    <section className="py-24 border-y border-black/[0.06]" style={{ backgroundColor: "#F5F2ED" }}>
      <div className="container mx-auto px-6 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-black/25" />
            <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-black/45">
              {experienceEyebrow} {businessName}
            </span>
            <span className="w-8 h-px bg-black/25" />
          </div>
          <SectionTitle
            title={experienceTitle}
            fallbackLine1="Güvenin"
            fallbackLine2="Sayılarla Kanıtı"
            className="text-3xl md:text-4xl font-serif font-light text-black tracking-tight"
            line2ClassName="italic text-black/40"
          />
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/10 rounded-2xl overflow-hidden border border-black/10">
          {highlights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#EDEAE4] p-8 lg:p-10 text-center group hover:bg-white transition-colors duration-500"
            >
              <p className="text-4xl md:text-5xl font-serif font-light text-black">
                <span className="text-[#C8703A]">{item.value}</span>
                <span className="text-lg text-black/30">{item.suffix}</span>
              </p>
              <p className="mt-3 text-[10px] font-bold tracking-[0.25em] uppercase text-black/40">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
