"use client";

import { motion } from "framer-motion";
import {
  CalendarClock,
  Scissors,
  Sparkles,
  Coffee,
  ShieldCheck,
} from "lucide-react";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { parseHomeStatsJson } from "@/lib/data/home-content";

const ICONS = [CalendarClock, Scissors, Sparkles, Coffee, ShieldCheck];

export default function StatsStrip() {
  const { homeStatsJson } = usePublicSettings();
  const features = parseHomeStatsJson(homeStatsJson);

  return (
    <section className="bg-[#080D15] border-y border-white/[0.07]">
      <div className="container mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 divide-x divide-white/10">
          {features.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];

            return (
              <motion.div
                key={`${item.title}-${i}`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                }}
                className="group flex flex-col items-center text-center py-10 px-6"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 transition-all duration-500 group-hover:border-white/50 group-hover:bg-white/5">
                  <Icon
                    size={24}
                    className="text-white transition-colors duration-500 group-hover:text-white"
                  />
                </div>

                <h3 className="text-sm uppercase tracking-[0.25em] font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/45 max-w-[170px]">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
