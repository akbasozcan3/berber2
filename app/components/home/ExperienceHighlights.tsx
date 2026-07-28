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
    <section className="section-light py-24 border-y border-black/[0.08]">
      <div className="container mx-auto px-6 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-black/25" />
            <span className="type-eyebrow-light">
              {experienceEyebrow} {businessName}
            </span>
            <span className="w-8 h-px bg-black/25" />
          </div>
          <SectionTitle
            title={experienceTitle}
            fallbackLine1="Güvenin"
            fallbackLine2="Sayılarla Kanıtı"
            className="type-display-light text-3xl md:text-4xl"
            line2ClassName="type-display-light-accent"
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
              <p className="text-4xl md:text-5xl font-serif font-medium text-black">
                <span className="text-[#C8703A]">{item.value}</span>
                <span className="text-lg text-neutral-500">{item.suffix}</span>
              </p>
              <p className="mt-3 type-label-light">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
