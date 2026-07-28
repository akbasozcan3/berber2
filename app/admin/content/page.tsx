"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Textarea from "@/components/admin/ui/Textarea";
import ImageUpload from "@/components/admin/ui/ImageUpload";

const PAGES = [
  { slug: "about", label: "Hakkımızda (Ana Sayfa + Sayfa)" },
  { slug: "home_quote", label: "Ana Sayfa Felsefe Banner" },
  { slug: "home_how_it_works", label: "Ana Sayfa Nasıl Çalışır" },
  { slug: "legal_privacy", label: "Gizlilik Politikası" },
  { slug: "legal_kvkk", label: "KVKK Metni" },
  { slug: "legal_cookies", label: "Çerez Politikası" },
  { slug: "legal_terms", label: "Kullanım Koşulları" },
];

export default function ContentAdminPage() {
  const [activeSlug, setActiveSlug] = useState("about");
  const [form, setForm] = useState({ title: "", subtitle: "", heroImage: "", content: "", sectionsJson: "", metaJson: "" });
  const [saved, setSaved] = useState(false);

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
            sectionsJson: data.sections || "",
            metaJson: data.meta || "",
          });
        } else {
          setForm({ title: "", subtitle: "", heroImage: "", content: "", sectionsJson: "", metaJson: "" });
        }
      });
  }, [activeSlug]);

  const save = async () => {
    const payload: Record<string, unknown> = { slug: activeSlug, ...form };
    delete payload.sectionsJson;
    delete payload.metaJson;
    if (form.sectionsJson.trim()) {
      try {
        payload.sections = JSON.parse(form.sectionsJson);
      } catch {
        alert("Sections JSON geçersiz.");
        return;
      }
    }
    if (form.metaJson.trim()) {
      try {
        payload.meta = JSON.parse(form.metaJson);
      } catch {
        alert("Meta JSON geçersiz.");
        return;
      }
    }
    await fetch("/api/v1/admin/content", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="İçerik Yönetimi"
        description="Sayfa metinleri ve görseller"
        actions={
          <Button onClick={save}>
            <Save className="w-4 h-4" />
            {saved ? "Kaydedildi!" : "Kaydet"}
          </Button>
        }
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGES.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActiveSlug(p.slug)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSlug === p.slug
                ? "bg-[#C8703A] text-black"
                : "bg-white/[0.04] text-[#71717A] hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="space-y-4">
          <Input
            label="Başlık"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Alt Başlık"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
          <ImageUpload
            label="Banner Görseli"
            folder="content"
            value={form.heroImage}
            onChange={(heroImage) => setForm({ ...form, heroImage })}
            previewHeightClass="h-48"
          />
          <div>
            <label className="text-xs text-[#71717A] mb-2 block">İçerik (HTML destekli)</label>
            <Textarea
              rows={20}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="font-mono text-sm"
              placeholder="<p>Makale içeriği...</p>"
            />
          </div>
          {activeSlug === "home_how_it_works" && (
            <>
              <div>
                <label className="text-xs text-[#71717A] mb-2 block">Adımlar (JSON)</label>
                <Textarea
                  rows={8}
                  value={form.sectionsJson}
                  onChange={(e) => setForm({ ...form, sectionsJson: e.target.value })}
                  className="font-mono text-sm"
                  placeholder='[{"step":"01","title":"...","desc":"..."}]'
                />
              </div>
              <div>
                <label className="text-xs text-[#71717A] mb-2 block">CTA (JSON)</label>
                <Textarea
                  rows={3}
                  value={form.metaJson}
                  onChange={(e) => setForm({ ...form, metaJson: e.target.value })}
                  className="font-mono text-sm"
                  placeholder='{"ctaLabel":"Hemen Randevu Al"}'
                />
              </div>
            </>
          )}
          {(activeSlug === "about" || activeSlug === "home_quote") && (
            <div>
              <label className="text-xs text-[#71717A] mb-2 block">Ek Bölümler (JSON)</label>
              <Textarea
                rows={8}
                value={form.sectionsJson}
                onChange={(e) => setForm({ ...form, sectionsJson: e.target.value })}
                className="font-mono text-sm"
                placeholder='[{"title":"Zanaat","desc":"Özenli İşçilik"}]'
              />
            </div>
          )}
          {activeSlug === "about" && (
            <p className="text-xs text-[#71717A]">
              Bu içerik hem ana sayfadaki Hakkımızda bölümünde hem de /hakkimizda sayfasında görünür.
              Ana sayfada kısa özet, sayfada tam HTML içerik gösterilir.
            </p>
          )}
          {(activeSlug === "about" || activeSlug.startsWith("legal_")) && (
            <p className="text-xs text-[#52525B]">
              HTML etiketleri kullanabilirsiniz: &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
