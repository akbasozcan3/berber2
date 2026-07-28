"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { api, type Review } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { getInitials } from "@/lib/utils/format";
import SectionTitle from "@/components/ui/SectionTitle";

interface TestimonialsSliderProps {
  initialReviews?: Review[];
}

export default function TestimonialsSlider({ initialReviews = [] }: TestimonialsSliderProps) {
  const settings = usePublicSettings();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (initialReviews.length > 0) return;
    api.getReviews(true).then((data) => {
      if (data.length > 0) setReviews(data);
      else api.getReviews().then(setReviews).catch(() => {});
    }).catch(() => {});
  }, [initialReviews.length]);

  const next = useCallback(() => {
    if (reviews.length === 0) return;
    setCurrent((c) => (c + 1) % reviews.length);
  }, [reviews.length]);

  const prev = useCallback(() => {
    if (reviews.length === 0) return;
    setCurrent((c) => (c - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length === 0) return;
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next, reviews.length]);

  if (reviews.length === 0) return null;

  const review = reviews[current];

  return (
    <section className="section-light py-28 relative overflow-hidden border-y border-black/[0.08]">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[240px] font-serif leading-none text-black/[0.025] select-none pointer-events-none">
        &ldquo;
      </div>

      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px bg-black/25" />
              <span className="type-eyebrow-light">
                {settings.homeTestimonialsEyebrow || settings.reviewsPageTitle}
              </span>
            </div>
            <SectionTitle
              title={settings.homeTestimonialsTitle}
              fallbackLine1="Deneyimleyenlerin"
              fallbackLine2="Gözünden"
              className="type-display-light text-4xl md:text-5xl lg:text-[3.35rem]"
              line2ClassName="type-display-light-accent"
            />
          </div>
          <Link href="/yorumlar" className="type-link-light group flex items-center gap-2 shrink-0">
            Tüm Yorumlar
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="flex gap-1 mb-8">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-black fill-current" strokeWidth={0} />
                  ))}
                </div>

                <blockquote className="text-2xl md:text-3xl font-serif font-normal text-black leading-[1.5] mb-10">
                  &ldquo;{review.review}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black/[0.04] border border-black/10 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold tracking-wider text-black/70">
                      {getInitials(review.customerName)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">{review.customerName}</p>
                    <p className="text-[10px] type-label-light mt-0.5">
                      {review.source === "google" ? "Google Yorumu" : "Müşteri Yorumu"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-8">
            <div className="text-right">
              <span className="text-5xl font-serif font-light text-black">
                {String(current + 1).padStart(2, "0")}
              </span>
              <span className="text-neutral-300 font-serif text-2xl">
                {" "}/ {String(reviews.length).padStart(2, "0")}
              </span>
            </div>

            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-500 rounded-full ${
                    i === current ? "w-8 h-1.5 bg-black" : "w-1.5 h-1.5 bg-black/15 hover:bg-black/40"
                  }`}
                  aria-label={`Yorum ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-black/12 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-all duration-300"
                aria-label="Önceki"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full bg-[#C8703A] flex items-center justify-center text-white hover:bg-[#B5612E] transition-all duration-300"
                aria-label="Sonraki"
              >
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="pt-6 border-t border-black/[0.08] w-full text-left lg:text-right">
              <div className="flex items-center justify-start lg:justify-end gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="text-black fill-current" strokeWidth={0} />
                ))}
              </div>
              <p className="text-xs font-semibold text-black">{settings.googleRating} / 5.0</p>
              <p className="type-label-light mt-0.5">
                {settings.googleReviewCount}+ Google Yorumu
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
