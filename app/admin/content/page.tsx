"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, CheckCircle } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Textarea from "@/components/admin/ui/Textarea";
import ImageUpload from "@/components/admin/ui/ImageUpload";

const PAGES = [
  { slug: "about", label: "Hakkımızda (Ana Sayfa + Sayfa)" },
  { slug: "videolar", label: "Videolar & Reels Metinleri" },
  { slug: "home_quote", label: "Ana Sayfa Felsefe Banner" },
  { slug: "home_how_it_works", label: "Ana Sayfa Nasıl Çalışır (3 Adım)" },
  { slug: "legal_privacy", label: "Gizlilik Politikası" },
  { slug: "legal_kvkk", label: "KVKK Metni" },
  { slug: "legal_cookies", label: "Çerez Politikası" },
  { slug: "legal_terms", label: "Kullanım Koşulları" },
];

interface StepItem {
  step: string;
  title: string;
  desc: string;
}

interface HighlightItem {
  title: string;
  desc: string;
}

export default function ContentAdminPage() {
  const [activeSlug, setActiveSlug] = useState("about");
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    heroImage: "",
    content: "",
  });
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [ctaLabel, setCtaLabel] = useState("");
  const [quoteDesc, setQuoteDesc] = useState("");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch(`/api/v1/admin/content?slug=${activeSlug}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            title: data.title || "",
            subtitle: data.subtitle || "",
            heroImage: data.heroImage || "",
            content: data.content || "",
          });

          // Sections parsing
          if (data.sections) {
            try {
              const parsed = typeof data.sections === "string" ? JSON.parse(data.sections) : data.sections;
              if (Array.isArray(parsed)) {
                if (activeSlug === "home_how_it_works") {
                  setSteps(parsed.map((item, i) => ({
                    step: item.step || `0${i + 1}`,
                    title: item.title || "",
                    desc: item.desc || "",
                  })));
                } else {
                  setHighlights(parsed.map((item) => ({
                    title: item.title || "",
                    desc: item.desc || "",
                  })));
                }
              } else if (typeof parsed === "object" && parsed.description) {
                setQuoteDesc(parsed.description || "");
              }
            } catch {
              // fallback
            }
          } else {
            if (activeSlug === "home_how_it_works") {
              setSteps([
                { step: "01", title: "Randevu Seçin", desc: "Hizmet, tarih ve saati online sistemimizden saniyeler içinde belirleyin." },
                { step: "02", title: "Stüdyoya Gelin", desc: "Sıra beklemeden, randevu saatinizde Mehmet İis ve ekibimiz tarafından karşılanın." },
                { step: "03", title: "Tarzınızı Yenileyin", desc: "Kişiye özel saç kesimi ve sakal tasarımı ile stüdyomuzdan özgüvenle ayrılın." },
              ]);
            } else if (activeSlug === "about") {
              setHighlights([
                { title: "Zanaat", desc: "Özenli İşçilik" },
                { title: "Konfor", desc: "Rahat Deneyim" },
                { title: "Hijyen", desc: "Temiz Standart" },
              ]);
            }
          }

          // Meta parsing
          if (data.meta) {
            try {
              const metaObj = typeof data.meta === "string" ? JSON.parse(data.meta) : data.meta;
              if (metaObj && metaObj.ctaLabel) {
                setCtaLabel(metaObj.ctaLabel);
              }
            } catch {
              // fallback
            }
          } else {
            setCtaLabel("Hemen Randevu Al");
          }
        } else {
          setForm({ title: "", subtitle: "", heroImage: "", content: "" });
          setSteps([]);
          setHighlights([]);
          setCtaLabel("");
          setQuoteDesc("");
        }
      })
      .catch(() => {});
  }, [activeSlug]);

  const save = async () => {
    const payload: Record<string, unknown> = {
      slug: activeSlug,
      title: form.title,
      subtitle: form.subtitle,
      heroImage: form.heroImage,
      content: form.content,
    };

    if (activeSlug === "home_how_it_works") {
      payload.sections = steps;
      payload.meta = { ctaLabel: ctaLabel.trim() || "Hemen Randevu Al" };
    } else if (activeSlug === "about") {
      payload.sections = highlights;
    } else if (activeSlug === "home_quote") {
      payload.sections = { description: quoteDesc };
    }

    try {
      await fetch("/api/v1/admin/content", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaved(true);
      showToast("İçerik başarıyla kaydedildi.");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      showToast("Kaydetme sırasında bir hata oluştu.");
    }
  };

  const updateStep = (index: number, field: keyof StepItem, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const updateHighlight = (index: number, field: keyof HighlightItem, value: string) => {
    setHighlights((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium shadow-2xl backdrop-blur-md">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <PageHeader
        title="İçerik & Metin Yönetimi"
        description="Sayfa başlıkları, açıklamaları, adımları ve görsellerini kullanıcı dostu formlarla yönetin."
        actions={
          <Button onClick={save}>
            <Save className="w-4 h-4" />
            {saved ? "Kaydedildi!" : "Tümünü Kaydet"}
          </Button>
        }
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGES.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setActiveSlug(p.slug)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeSlug === p.slug
                ? "bg-[#C8703A] text-white shadow-lg"
                : "bg-white/[0.04] text-[#A1A1AA] hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bölüm / Sayfa Başlığı"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              label="Üst Başlık (Eyebrow)"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>

          <ImageUpload
            label="Kapak / Banner Görseli"
            folder="content"
            value={form.heroImage}
            onChange={(heroImage) => setForm({ ...form, heroImage })}
            previewHeightClass="h-48"
          />

          <div>
            <label className="text-xs font-semibold text-[#A1A1AA] mb-2 block">
              Ana İçerik / Açıklama Metni
            </label>
            <Textarea
              rows={activeSlug.startsWith("legal_") ? 18 : 6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="text-sm leading-relaxed"
              placeholder="Açıklama veya sayfa metnini girin..."
            />
          </div>

          {/* Nasıl Çalışır (3 Adım) Görsel Form Alanları */}
          {activeSlug === "home_how_it_works" && (
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <h4 className="text-sm font-semibold text-[#F8F8F8] flex items-center gap-2">
                <span>Adımlar (Nasıl Çalışır Bölümü)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {steps.map((st, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-[#C8703A]/20 text-[#E5A869] flex items-center justify-center font-bold text-xs">
                        {st.step}
                      </span>
                      <span className="text-[11px] text-white/40 uppercase font-semibold">Adım {i + 1}</span>
                    </div>
                    <Input
                      label="Adım Başlığı"
                      value={st.title}
                      onChange={(e) => updateStep(i, "title", e.target.value)}
                    />
                    <Textarea
                      label="Açıklama"
                      rows={3}
                      value={st.desc}
                      onChange={(e) => updateStep(i, "desc", e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="max-w-xs pt-2">
                <Input
                  label="Randevu Buton Metni (CTA)"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Hemen Randevu Al"
                />
              </div>
            </div>
          )}

          {/* Hakkımızda Öne Çıkan Özellikler */}
          {activeSlug === "about" && (
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <h4 className="text-sm font-semibold text-[#F8F8F8]">
                Öne Çıkan 3 Değer / Madde
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {highlights.map((h, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                    <span className="text-xs font-bold text-[#E5A869]">Özellik #{i + 1}</span>
                    <Input
                      label="Başlık"
                      value={h.title}
                      onChange={(e) => updateHighlight(i, "title", e.target.value)}
                      placeholder="Örn: Zanaat"
                    />
                    <Input
                      label="Kısa Açıklama"
                      value={h.desc}
                      onChange={(e) => updateHighlight(i, "desc", e.target.value)}
                      placeholder="Örn: Özenli İşçilik"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Felsefe Banner Açıklama */}
          {activeSlug === "home_quote" && (
            <div className="pt-4 border-t border-white/[0.06]">
              <Textarea
                label="Felsefemiz Detay Açıklaması"
                rows={4}
                value={quoteDesc}
                onChange={(e) => setQuoteDesc(e.target.value)}
                placeholder="M Studio felsefesi detay metni..."
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
