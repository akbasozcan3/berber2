"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Plus, Save, Star, Trash2, XCircle } from "lucide-react";
import Input from "@/components/admin/ui/Input";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Avatar from "@/components/admin/ui/Avatar";
import Toggle from "@/components/admin/ui/Toggle";
import Badge from "@/components/admin/ui/Badge";
import Button from "@/components/admin/ui/Button";
import ImageUpload from "@/components/admin/ui/ImageUpload";
import { adminApi, type AdminBarber } from "@/lib/api/admin";
import { cn } from "@/lib/admin/cn";

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [edits, setEdits] = useState<Record<number, Partial<AdminBarber>>>({});
  const [newBarber, setNewBarber] = useState({
    name: "", slug: "", position: "Berber", specialty: "",
    workingStart: "09:00", workingEnd: "22:00", performance: "95",
  });

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 3000);
  };

  const loadBarbers = () =>
    adminApi.getBarbers().then((list) => {
      setBarbers(list);
      setEdits(Object.fromEntries(list.map((b) => [b.id, {
        name: b.name, position: b.position,
        specialty: b.specialty || "",
        workingStart: b.workingStart, workingEnd: b.workingEnd,
        performance: b.performance,
      }])));
    }).catch(() => showToast(false, "Berberler yüklenemedi."));

  useEffect(() => { loadBarbers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (id: number, field: "available" | "onVacation", value: boolean) => {
    try {
      await adminApi.updateBarber(id, { [field]: value });
      await loadBarbers();
    } catch {
      showToast(false, "Güncelleme başarısız.");
    }
  };

  const addBarber = async () => {
    const name = newBarber.name.trim();
    const slug = (newBarber.slug.trim() || slugifyName(name)).toLowerCase();
    if (!name) { showToast(false, "Berber adı gerekli."); return; }
    if (!slug) { showToast(false, "Geçerli bir berber adı girin."); return; }
    try {
      await adminApi.createBarber({
        name, slug,
        position: newBarber.position,
        specialty: newBarber.specialty,
        workingStart: newBarber.workingStart,
        workingEnd: newBarber.workingEnd,
        performance: Number(newBarber.performance || 95),
        workingDays: "1,2,3,4,5,6",
        available: true, onVacation: false,
      });
      setNewBarber({ name: "", slug: "", position: "Berber", specialty: "", workingStart: "09:00", workingEnd: "22:00", performance: "95" });
      await loadBarbers();
      showToast(true, `${name} eklendi.`);
    } catch (e) {
      showToast(false, e instanceof Error ? e.message : "Eklenemedi.");
    }
  };

  const saveBarber = async (id: number) => {
    const draft = edits[id];
    if (!draft?.name?.trim()) { showToast(false, "Ad boş olamaz."); return; }
    setSavingId(id);
    try {
      await adminApi.updateBarber(id, {
        name: draft.name.trim(),
        position: draft.position,
        specialty: (draft.specialty as string) || null,
        workingStart: draft.workingStart,
        workingEnd: draft.workingEnd,
        performance: Number(draft.performance || 95),
      });
      await loadBarbers();
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
      showToast(true, "Bilgiler kaydedildi.");
    } catch (e) {
      showToast(false, e instanceof Error ? e.message : "Kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSavingId(null);
    }
  };

  const removeBarber = async (id: number) => {
    if (!window.confirm("Bu berberi silmek istediğinizden emin misiniz?")) return;
    try {
      await adminApi.deleteBarber(id);
      await loadBarbers();
      showToast(true, "Berber silindi.");
    } catch (e) {
      showToast(false, e instanceof Error ? e.message : "Berber silinemedi.");
    }
  };

  return (
    <div>
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg",
          toast.ok ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {toast.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.text}
        </div>
      )}

      <PageHeader title="Berberler" description="Ekibinizi yönetin" />

      <Card className="mb-6">
        <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Yeni Berber Ekle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input className="h-11 bg-[#0D1117] border border-white/[0.06] rounded-2xl px-4 text-sm md:col-span-2 text-white"
            placeholder="Berber Adı (ör. Mehmet Abi)" value={newBarber.name}
            onChange={(e) => setNewBarber((p) => ({ ...p, name: e.target.value }))} />
          <input className="h-11 bg-[#0D1117] border border-white/[0.06] rounded-2xl px-4 text-sm text-white"
            placeholder="Pozisyon" value={newBarber.position}
            onChange={(e) => setNewBarber((p) => ({ ...p, position: e.target.value }))} />
          <input className="h-11 bg-[#0D1117] border border-white/[0.06] rounded-2xl px-4 text-sm text-white"
            placeholder="Uzmanlık" value={newBarber.specialty}
            onChange={(e) => setNewBarber((p) => ({ ...p, specialty: e.target.value }))} />
          <input className="h-11 bg-[#0D1117] border border-white/[0.06] rounded-2xl px-4 text-sm text-white"
            placeholder="Başlangıç (09:00)" value={newBarber.workingStart}
            onChange={(e) => setNewBarber((p) => ({ ...p, workingStart: e.target.value }))} />
          <input className="h-11 bg-[#0D1117] border border-white/[0.06] rounded-2xl px-4 text-sm text-white"
            placeholder="Bitiş (22:00)" value={newBarber.workingEnd}
            onChange={(e) => setNewBarber((p) => ({ ...p, workingEnd: e.target.value }))} />
          <input className="h-11 bg-[#0D1117] border border-white/[0.06] rounded-2xl px-4 text-sm text-white"
            placeholder="Performans (95)" value={newBarber.performance}
            onChange={(e) => setNewBarber((p) => ({ ...p, performance: e.target.value }))} />
          <Button onClick={addBarber}><Plus className="w-4 h-4" />Berber Ekle</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {barbers.map((barber, i) => (
          <motion.div key={barber.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card hover>
              <div className="flex items-start gap-5">
                <Avatar name={barber.name} src={barber.avatar || undefined} size="xl" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#F8F8F8]">{barber.name}</h3>
                  <p className="text-sm text-[#C8703A]">{barber.position}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 text-[#C8703A] fill-[#C8703A]" />
                    <span className="text-sm font-medium">{barber.performance}%</span>
                  </div>
                </div>
                {barber.onVacation && <Badge label="Tatilde" variant="outline" />}
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm text-[#71717A]">
                <Clock className="w-4 h-4" />
                {barber.workingStart} — {barber.workingEnd}
              </div>
              {barber.specialty && <p className="text-xs text-[#71717A] mt-2">{barber.specialty}</p>}

              <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Input label="Ad" value={edits[barber.id]?.name ?? barber.name}
                    onChange={(e) => setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], name: e.target.value } }))} />
                  <Input label="Pozisyon" value={edits[barber.id]?.position ?? barber.position}
                    onChange={(e) => setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], position: e.target.value } }))} />
                  <Input label="Uzmanlık" value={(edits[barber.id]?.specialty as string) ?? barber.specialty ?? ""}
                    onChange={(e) => setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], specialty: e.target.value } }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Başlangıç" value={edits[barber.id]?.workingStart ?? barber.workingStart}
                      onChange={(e) => setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], workingStart: e.target.value } }))} />
                    <Input label="Bitiş" value={edits[barber.id]?.workingEnd ?? barber.workingEnd}
                      onChange={(e) => setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], workingEnd: e.target.value } }))} />
                  </div>
                  <Input label="Performans (%)" type="number"
                    value={String(edits[barber.id]?.performance ?? barber.performance)}
                    onChange={(e) => setEdits((p) => ({ ...p, [barber.id]: { ...p[barber.id], performance: Number(e.target.value) } }))} />

                  <Button
                    onClick={() => saveBarber(barber.id)}
                    disabled={savingId === barber.id}
                    variant={savedId === barber.id ? "primary" : "primary"}
                  >
                    <Save className="w-4 h-4" />
                    {savingId === barber.id ? "Kaydediliyor..." : savedId === barber.id ? "✓ Kaydedildi!" : "Bilgileri Kaydet"}
                  </Button>
                </div>

                <Toggle label="Müsait" checked={barber.available}
                  onChange={(v) => toggle(barber.id, "available", v)}
                  disabled={barber.onVacation} />
                <Toggle label="Tatil Modu" checked={barber.onVacation}
                  onChange={(v) => toggle(barber.id, "onVacation", v)} />

                <ImageUpload
                  label="Berber Görseli"
                  folder="barbers"
                  value={barber.avatar || ""}
                  onChange={async (url) => {
                    setSavingId(barber.id);
                    try {
                      await adminApi.updateBarber(barber.id, { avatar: url });
                      await loadBarbers();
                      showToast(true, "Fotoğraf güncellendi.");
                    } catch {
                      showToast(false, "Fotoğraf kaydedilemedi.");
                    } finally {
                      setSavingId(null);
                    }
                  }}
                  previewHeightClass="h-36"
                />

                <Button variant="danger" onClick={() => removeBarber(barber.id)}>
                  <Trash2 className="w-4 h-4" />
                  Berberi Sil
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
