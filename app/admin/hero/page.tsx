"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, CheckCircle, Sparkles, Image as ImageIcon } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Textarea from "@/components/admin/ui/Textarea";
import Toggle from "@/components/admin/ui/Toggle";
import ImageUpload from "@/components/admin/ui/ImageUpload";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string | null;
  ctaText: string;
  ctaLink: string;
  sortOrder: number;
  enabled: boolean;
}

const HERO_IMAGE_PRESETS = [
  {
    name: "Modern Saç Kesimi",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=85&w=2560&auto=format&fit=crop",
  },
  {
    name: "Ustura & Sakal Tasarımı",
    url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=85&w=2560&auto=format&fit=crop",
  },
  {
    name: "Skin Fade & Quiff",
    url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=85&w=2560&auto=format&fit=crop",
  },
  {
    name: "VIP Sıcak Havlu",
    url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=85&w=2560&auto=format&fit=crop",
  },
  {
    name: "Lüks Salon Detayı",
    url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=85&w=2560&auto=format&fit=crop",
  },
  {
    name: "Klasik Berber Zanaatı",
    url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=85&w=2560&auto=format&fit=crop",
  },
];

export default function HeroAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  const load = () =>
    fetch("/api/v1/admin/hero", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSlides(data);
      })
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const update = (id: number, field: string, value: string | boolean | number) => {
    setSlides((s) => s.map((sl) => (sl.id === id ? { ...sl, [field]: value } : sl)));
  };

  const saveSlide = async (slide: Slide) => {
    try {
      const res = await fetch("/api/v1/admin/hero", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slide),
      });
      if (res.ok) {
        showToast(`Slayt #${slide.sortOrder} kaydedildi.`);
      } else {
        showToast("Kaydetme hatası.");
      }
    } catch {
      showToast("Bağlantı hatası.");
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const slide of slides) {
        await fetch("/api/v1/admin/hero", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slide),
        });
      }
      setSaved(true);
      showToast("Tüm slaytlar başarıyla güncellendi.");
      setTimeout(() => setSaved(false), 2000);
      load();
    } catch {
      showToast("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const addSlide = async () => {
    const nextOrder = slides.length + 1;
    await fetch("/api/v1/admin/hero", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Kişisel Tarzınızın İmzası",
        subtitle: "M Studio Hairdresser · Mehmet İis",
        description: "Profesyonel kadromuzla kaliteli saç & sakal tasarımı.",
        image: HERO_IMAGE_PRESETS[0].url,
        badge: "Master Hair Stylist",
        ctaText: "Randevu Al",
        ctaLink: "/randevu",
        sortOrder: nextOrder,
        enabled: true,
      }),
    });
    showToast("Yeni slayt eklendi.");
    load();
  };

  const deleteSlide = async (id: number) => {
    if (!confirm("Bu slaytı silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/v1/admin/hero?id=${id}`, { method: "DELETE", credentials: "include" });
    showToast("Slayt silindi.");
    load();
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
        title="Banner / Slider Yönetimi"
        description="Ana sayfa en üstte görünen büyük slaytların görsellerini, başlıklarını ve butonlarını buradan düzenleyin."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={addSlide}>
              <Plus className="w-4 h-4" /> Slayt Ekle
            </Button>
            <Button onClick={saveAll} disabled={saving}>
              <Save className="w-4 h-4" />
              {saved ? "Kaydedildi!" : saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {slides.length === 0 && (
          <Card>
            <div className="text-center py-12 space-y-4">
              <ImageIcon className="w-12 h-12 text-white/20 mx-auto" />
              <p className="text-white/50 text-sm">Henüz kayıtlı slayt bulunmuyor.</p>
              <Button onClick={addSlide}>
                <Plus className="w-4 h-4" /> İlk Slaytı Oluştur
              </Button>
            </div>
          </Card>
        )}

        {slides.map((slide) => (
          <Card key={slide.id}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#C8703A]/20 text-[#E5A869] flex items-center justify-center font-bold text-xs">
                  0{slide.sortOrder}
                </span>
                <h3 className="text-sm font-semibold text-[#F8F8F8]">
                  Slayt #{slide.sortOrder}: {slide.title.replace(/\n/g, " ")}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <Toggle
                  label="Aktif"
                  checked={slide.enabled}
                  onChange={(v) => update(slide.id, "enabled", v)}
                />
                <Button variant="secondary" size="sm" onClick={() => saveSlide(slide)}>
                  <Save className="w-3.5 h-3.5" /> Kaydet
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteSlide(slide.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Başlık (Alt satır için Enter kullanabilirsiniz)"
                value={slide.title}
                onChange={(e) => update(slide.id, "title", e.target.value)}
              />
              <Input
                label="Üst Başlık (Eyebrow)"
                value={slide.subtitle}
                onChange={(e) => update(slide.id, "subtitle", e.target.value)}
              />
              <Textarea
                label="Açıklama Metni"
                value={slide.description}
                onChange={(e) => update(slide.id, "description", e.target.value)}
                className="md:col-span-2"
                rows={2}
              />

              {/* Görsel Yükleme ve Hızlı Seçim */}
              <div className="md:col-span-2 space-y-3">
                <ImageUpload
                  label="Slayt Görseli (Dosyadan Yükle)"
                  folder="hero"
                  value={slide.image}
                  onChange={(url) => update(slide.id, "image", url)}
                  previewHeightClass="h-52"
                />

                <Input
                  label="veya Doğrudan Görsel URL'si"
                  value={slide.image}
                  onChange={(e) => update(slide.id, "image", e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />

                {/* Hızlı Lüks Görsel Şablonları */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#E5A869]">
                    <Sparkles size={12} className="text-[#C8703A]" />
                    <span>Önerilen Yüksek Çözünürlüklü Berber Fotoğrafları (Tek Tıkla Seç)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HERO_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => update(slide.id, "image", preset.url)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          slide.image === preset.url
                            ? "bg-[#C8703A]/20 border-[#C8703A] text-white"
                            : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white hover:border-white/25"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Input
                label="Rozet (Badge)"
                value={slide.badge || ""}
                onChange={(e) => update(slide.id, "badge", e.target.value)}
                placeholder="Master Hair Stylist"
              />
              <Input
                label="Sıralama"
                type="number"
                value={String(slide.sortOrder)}
                onChange={(e) => update(slide.id, "sortOrder", Number(e.target.value))}
              />
              <Input
                label="CTA Buton Metni"
                value={slide.ctaText}
                onChange={(e) => update(slide.id, "ctaText", e.target.value)}
                placeholder="Randevu Al"
              />
              <Input
                label="CTA Buton Linki"
                value={slide.ctaLink}
                onChange={(e) => update(slide.id, "ctaLink", e.target.value)}
                placeholder="/randevu"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
