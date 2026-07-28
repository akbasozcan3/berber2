"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Star, Send, CheckCircle } from "lucide-react";
import { api, type Review } from "@/lib/api/client";

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", rating: 5, review: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getReviews().then(setReviews).catch(() => {});
  }, []);

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const displayReviews = reviews.slice(0, 9);

  return (
    <section id="testimonials" className="py-32 bg-black relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/8" />
      <div className="container mx-auto px-6 md:px-16 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 h-[1px] bg-white" />
            <p className="text-[10px] font-bold tracking-[0.35em] text-white/60 uppercase">Google Yorumları</p>
            <span className="w-8 h-[1px] bg-white" />
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white mb-4 leading-[1.05]">
            Deneyimleyenlerin <span className="italic text-white/30 font-light">Gözünden</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} className="text-white/60 fill-white" />
              ))}
            </div>
            <span className="text-white font-semibold">4.87</span>
            <span className="text-white/40 text-sm">/ 5.0 · 30+ Google Yorumu</span>
          </div>
          <p className="text-white/45 text-lg max-w-xl mx-auto font-light">
            Gerçek müşteri yorumları. Siz de deneyiminizi paylaşın.
          </p>
        </div>

        {submitted && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto mb-8 p-4 bg-white/5 border border-white/15 rounded-2xl flex items-center gap-3 text-white/60">
            <CheckCircle size={20} />
            <p className="text-sm">Yorumunuz alındı! Onaylandıktan sonra yayınlanacaktır.</p>
          </motion.div>
        )}

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05]">
          {displayReviews.map((item) => (
            <motion.div key={item.id} variants={cardVariants}
              className="group bg-black hover:bg-white/[0.03] p-8 md:p-10 flex flex-col justify-between transition-all duration-500">
              <div>
                <div className="flex gap-1 text-white/60 mb-4">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-white/50 font-light text-sm leading-relaxed italic mb-6">&ldquo;{item.review}&rdquo;</p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-white/60">
                      {item.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.customerName}</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">
                      {item.source === "google" ? "Google Yorumu" : "Müşteri Yorumu"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-16">
          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-white px-10 py-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all">
              <Send size={14} /> Yorumunuzu Yazın
            </button>
          ) : (
            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit} className="max-w-lg mx-auto bg-[#141E2E] border border-white/[0.06] rounded-2xl p-8 text-left space-y-5">
              <h3 className="text-lg font-semibold text-white text-center">Deneyiminizi Paylaşın</h3>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Adınız</label>
                <input type="text" required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full bg-[#0D1117] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">E-posta</label>
                <input type="email" required value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  className="w-full bg-[#0D1117] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30" placeholder="ornek@email.com" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Puanınız</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}
                      className={`p-1 transition-colors ${r <= form.rating ? "text-white/60" : "text-white/20"}`}>
                      <Star size={24} fill={r <= form.rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Yorumunuz</label>
                <textarea required minLength={10} value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })}
                  className="w-full bg-[#0D1117] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 min-h-[100px] resize-none" placeholder="Deneyiminizi anlatın..." />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-white/10 text-white/60 py-3 rounded-xl text-sm">İptal</button>
                <button type="submit" disabled={loading} className="flex-1 bg-white text-black py-3 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {loading ? "Gönderiliyor..." : "Gönder"}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
