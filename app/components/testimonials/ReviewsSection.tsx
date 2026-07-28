"use client";

import { useState } from "react";
import { Star, Send, CheckCircle, Quote, Mail } from "lucide-react";
import { api, type Review } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { getInitials } from "@/lib/utils/format";

interface ReviewsSectionProps {
  initialReviews: Review[];
  googleRating: string;
  googleReviewCount: string;
}

export default function ReviewsSection({
  initialReviews,
  googleRating,
  googleReviewCount,
}: ReviewsSectionProps) {
  const { reviewsSectionIntro, reviewsFeaturedQuote } = usePublicSettings();
  const [reviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    rating: 5,
    review: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.submitReview(form);
      setSubmitted(true);
      setShowForm(false);
      setForm({ customerName: "", customerEmail: "", rating: 5, review: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yorum gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-light py-16 md:py-24 border-b border-black/[0.06]">
      <div className="container mx-auto px-6 lg:px-14 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 mb-10 md:mb-14">
          <div className="lg:col-span-7 rounded-2xl border border-black/[0.08] bg-white p-8 md:p-10 shadow-sm">
            <p className="type-eyebrow-light mb-4">
              Google Değerlendirmesi
            </p>
            <div className="flex flex-wrap items-end gap-4 mb-4">
              <span className="text-6xl md:text-7xl font-serif font-medium text-black leading-none">
                {googleRating}
              </span>
              <div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={18} className="text-black fill-black" />
                  ))}
                </div>
                <p className="type-meta-light">{googleReviewCount}+ müşteri yorumu</p>
              </div>
            </div>
            <p className="type-body-light max-w-xl">
              {reviewsSectionIntro}
            </p>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-black/10 bg-black/[0.03] p-8 md:p-10 flex flex-col justify-center">
            <Quote size={28} className="text-black/40 mb-4" strokeWidth={1.5} />
            <p className="text-black font-serif text-xl font-light italic leading-relaxed mb-6">
              &ldquo;{reviewsFeaturedQuote}&rdquo;
            </p>
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-black/85 px-6 py-3.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-colors w-full"
              >
                <Send size={14} />
                Yorumunuzu Yazın
              </button>
            )}
          </div>
        </div>

        {submitted && (
          <div className="mb-8 p-4 bg-black/[0.04] border border-black/10 rounded-xl flex items-center gap-3 text-black/70 max-w-2xl mx-auto">
            <CheckCircle size={20} />
            <p className="text-sm">Yorumunuz alındı! Onaylandıktan sonra yayınlanacaktır.</p>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-12 max-w-3xl mx-auto bg-white border border-black/[0.08] rounded-2xl p-6 md:p-8 space-y-5 shadow-sm"
          >
            <h3 className="text-xl font-serif font-light text-black">Deneyiminizi Paylaşın</h3>
            <p className="text-sm text-black/45 -mt-2">
              Adınız, e-postanız ve yorumunuz admin onayından sonra yayınlanır.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-black/40 uppercase tracking-wider block mb-2">
                  Adınız
                </label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full bg-[#F5F5F5] border border-black/[0.08] rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:border-black/30"
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <label className="text-xs text-black/40 uppercase tracking-wider block mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
                  />
                  <input
                    type="email"
                    required
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full bg-[#F5F5F5] border border-black/[0.08] rounded-xl pl-11 pr-4 py-3 text-black text-sm focus:outline-none focus:border-black/30"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-black/40 uppercase tracking-wider block mb-2">
                Puanınız
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, rating: r })}
                    className={`p-1 transition-colors ${r <= form.rating ? "text-black" : "text-black/20"}`}
                  >
                    <Star size={24} fill={r <= form.rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-black/40 uppercase tracking-wider block mb-2">
                Yorumunuz
              </label>
              <textarea
                required
                minLength={10}
                value={form.review}
                onChange={(e) => setForm({ ...form, review: e.target.value })}
                className="w-full bg-[#F5F5F5] border border-black/[0.08] rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:border-black/30 min-h-[120px] resize-none"
                placeholder="Deneyiminizi anlatın..."
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-black/10 text-black/60 py-3 rounded-xl text-sm hover:border-black/25 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-black/85 transition-colors"
              >
                {loading ? "Gönderiliyor..." : "Gönder"}
              </button>
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-black/40 text-center py-16">Henüz yayınlanmış yorum yok.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {reviews.map((item) => (
              <article
                key={item.id}
                className="flex flex-col h-full p-7 rounded-2xl border border-black/[0.08] bg-white hover:border-black/20 hover:shadow-sm transition-all"
              >
                <div className="flex gap-1 text-black mb-4">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-black/60 font-light text-sm leading-relaxed italic flex-1 mb-6">
                  &ldquo;{item.review}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-black/[0.06]">
                  <div className="w-10 h-10 rounded-full bg-black/[0.04] border border-black/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-black/60">
                      {getInitials(item.customerName)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-black truncate">{item.customerName}</h4>
                    <p className="text-[10px] text-black/35 uppercase tracking-wider">
                      {item.source === "google" ? "Google" : "Web Sitesi"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
