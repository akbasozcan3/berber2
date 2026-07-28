"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Plus, Save, Trash2, XCircle } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Badge from "@/components/admin/ui/Badge";
import Toggle from "@/components/admin/ui/Toggle";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import ImageUpload from "@/components/admin/ui/ImageUpload";
import { adminApi, type AdminService } from "@/lib/api/admin";
import { formatCurrency } from "@/lib/admin/utils";

type ServiceDraft = {
  name: string;
  description: string;
  duration: string;
  price: string;
  image: string;
};

function toDrafts(list: AdminService[]): Record<number, ServiceDraft> {
  return Object.fromEntries(
    list.map((item) => [
      item.id,
      {
        name: item.name,
        description: item.description,
        duration: String(item.duration),
        price: String(item.price),
        image: item.image || "",
      },
    ])
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [drafts, setDrafts] = useState<Record<number, ServiceDraft>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [newService, setNewService] = useState({
    name: "",
    slug: "",
    description: "",
    duration: "30",
    price: "0",
    sortOrder: "0",
  });

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 2800);
  };

  const load = useCallback(async () => {
    const list = await adminApi.getServices();
    setServices(list);
    setDrafts(toDrafts(list));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const toggle = async (id: number, enabled: boolean) => {
    await adminApi.updateService(id, { enabled });
    await load();
    showToast(true, enabled ? "Hizmet aktif edildi." : "Hizmet pasif edildi.");
  };

  const saveService = async (id: number, label?: string) => {
    const d = drafts[id];
    if (!d) return;

    const price = Number(d.price);
    if (!d.name.trim()) {
      showToast(false, "Hizmet adı boş olamaz.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      showToast(false, "Geçerli bir fiyat girin.");
      return;
    }

    setSavingId(id);
    try {
      await adminApi.updateService(id, {
        name: d.name.trim(),
        description: d.description,
        duration: Number(d.duration),
        price,
        image: d.image || null,
      });
      await load();
      showToast(true, label || `${d.name} kaydedildi · site fiyatı güncellendi.`);
    } catch (error) {
      showToast(false, error instanceof Error ? error.message : "Kaydedilemedi.");
    } finally {
      setSavingId(null);
    }
  };

  const saveAllPrices = async () => {
    setSavingAll(true);
    try {
      for (const service of services) {
        const d = drafts[service.id];
        if (!d) continue;
        const price = Number(d.price);
        if (!Number.isFinite(price) || price < 0) continue;
        await adminApi.updateService(service.id, {
          name: d.name.trim(),
          description: d.description,
          duration: Number(d.duration),
          price,
          image: d.image || null,
        });
      }
      await load();
      showToast(true, "Tüm fiyatlar kaydedildi. Sitede anında güncellenir.");
    } catch (error) {
      showToast(false, error instanceof Error ? error.message : "Toplu kayıt başarısız.");
    } finally {
      setSavingAll(false);
    }
  };

  const togglePopular = async (id: number, popular: boolean) => {
    await adminApi.updateService(id, { popular });
    await load();
    showToast(true, popular ? "Popüler olarak işaretlendi." : "Popüler işareti kaldırıldı.");
  };

  const addService = async () => {
    if (!newService.name.trim()) {
      showToast(false, "Hizmet adı gerekli.");
      return;
    }
    try {
      await adminApi.createService({
        name: newService.name.trim(),
        slug: newService.slug.trim() || undefined,
        description: newService.description,
        duration: Number(newService.duration),
        price: Number(newService.price),
        sortOrder: Number(newService.sortOrder),
        enabled: true,
        popular: false,
      });
      setNewService({ name: "", slug: "", description: "", duration: "30", price: "0", sortOrder: "0" });
      await load();
      showToast(true, "Yeni hizmet eklendi.");
    } catch (error) {
      showToast(false, error instanceof Error ? error.message : "Eklenemedi.");
    }
  };

  const removeService = async (id: number, name: string) => {
    const ok = window.confirm(`"${name}" hizmetini silmek istediğinizden emin misiniz?`);
    if (!ok) return;
    try {
      await adminApi.deleteService(id);
      await load();
      showToast(true, "Hizmet silindi.");
    } catch (error) {
      showToast(false, error instanceof Error ? error.message : "Silinemedi.");
    }
  };

  const setDraftField = (id: number, field: keyof ServiceDraft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { name: "", description: "", duration: "", price: "", image: "" }),
        [field]: value,
      },
    }));
  };

  return (
    <div>
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm border shadow-lg ${
            toast.ok
              ? "bg-green-500/10 border-green-500/30 text-green-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {toast.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.text}
        </div>
      )}

      <PageHeader
        title="Hizmetler ve Fiyat Listesi"
        description={`${services.length} hizmet · fiyat değişikliği sitede anında görünür`}
        actions={
          <Button onClick={saveAllPrices} disabled={savingAll || services.length === 0}>
            <Save className="w-4 h-4" />
            {savingAll ? "Kaydediliyor..." : "Tüm Fiyatları Kaydet"}
          </Button>
        }
      />

      <Card className="mb-6">
        <h3 className="text-base font-semibold text-[#F8F8F8] mb-4">Yeni Hizmet Ekle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input label="Hizmet Adı" value={newService.name} onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Slug (opsiyonel)" value={newService.slug} onChange={(e) => setNewService((p) => ({ ...p, slug: e.target.value }))} />
          <Input label="Süre (dk)" type="number" value={newService.duration} onChange={(e) => setNewService((p) => ({ ...p, duration: e.target.value }))} />
          <Input label="Fiyat (TL)" type="number" value={newService.price} onChange={(e) => setNewService((p) => ({ ...p, price: e.target.value }))} />
          <Input label="Sıra" type="number" value={newService.sortOrder} onChange={(e) => setNewService((p) => ({ ...p, sortOrder: e.target.value }))} />
          <Input label="Açıklama" value={newService.description} onChange={(e) => setNewService((p) => ({ ...p, description: e.target.value }))} />
          <Button onClick={addService} className="self-end">
            <Plus className="w-4 h-4" />
            Hizmet Ekle
          </Button>
        </div>
      </Card>

      <Card className="mb-6">
        <h3 className="text-base font-semibold text-[#F8F8F8] mb-2">Hızlı Fiyat Güncelleme</h3>
        <p className="text-sm text-[#71717A] mb-5">
          Saç kesimi, sakal ve diğer hizmet fiyatlarını buradan değiştirin. Kaydettikten sonra ana sayfa,
          hizmetler sayfası ve randevu ekranında yeni fiyat görünür.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                <th className="px-4 py-3 text-xs uppercase text-[#71717A]">Hizmet</th>
                <th className="px-4 py-3 text-xs uppercase text-[#71717A]">Süre</th>
                <th className="px-4 py-3 text-xs uppercase text-[#71717A]">Fiyat (TL)</th>
                <th className="px-4 py-3 text-xs uppercase text-[#71717A]">Sitede Görünen</th>
                <th className="px-4 py-3 text-xs uppercase text-[#71717A]">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => {
                const draft = drafts[service.id];
                const draftPrice = Number(draft?.price ?? service.price);
                const changed = draft?.price !== String(service.price) || draft?.name !== service.name;

                return (
                  <tr key={service.id} className="border-b border-white/[0.04]">
                    <td className="px-4 py-3">
                      <input
                        value={draft?.name ?? service.name}
                        onChange={(e) => setDraftField(service.id, "name", e.target.value)}
                        className="w-full h-10 bg-[#0D1117] border border-white/[0.08] rounded-xl px-3 text-sm text-[#F8F8F8]"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#A1A1AA]">{service.duration} dk</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={draft?.price ?? String(service.price)}
                        onChange={(e) => setDraftField(service.id, "price", e.target.value)}
                        className="w-28 h-10 bg-[#0D1117] border border-[#C8703A]/30 rounded-xl px-3 text-sm text-[#C8703A] font-semibold"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#C8703A]">
                      {formatCurrency(Number.isFinite(draftPrice) ? draftPrice : service.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant={changed ? "primary" : "secondary"}
                        onClick={() => saveService(service.id)}
                        disabled={savingId === service.id}
                      >
                        {savingId === service.id ? "..." : "Kaydet"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {services.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card hover padding="none" className="overflow-hidden">
              {service.image && (
                <div className="relative h-40">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                  {service.popular && (
                    <div className="absolute top-3 left-3">
                      <Badge label="Popüler" variant="gold" />
                    </div>
                  )}
                </div>
              )}
              <div className="p-5">
                <h3 className="text-base font-semibold text-[#F8F8F8]">{service.name}</h3>
                <p className="text-sm text-[#71717A] mt-1 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-[#71717A]">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm">{service.duration} dk</span>
                  </div>
                  <p className="text-lg font-semibold text-[#C8703A]">{formatCurrency(service.price)}</p>
                </div>
                <div className="mt-4">
                  <Toggle
                    label={service.enabled ? "Aktif" : "Pasif"}
                    checked={service.enabled}
                    onChange={(v) => toggle(service.id, v)}
                  />
                </div>
                <div className="mt-4 space-y-3">
                  <Toggle
                    label="Popüler"
                    checked={service.popular}
                    onChange={(v) => togglePopular(service.id, v)}
                  />
                  <Input
                    label="Sıra"
                    type="number"
                    value={String(service.sortOrder ?? 0)}
                    onChange={async (e) => {
                      await adminApi.updateService(service.id, { sortOrder: Number(e.target.value) });
                      await load();
                    }}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <Input
                    label="Hizmet Adı"
                    value={drafts[service.id]?.name || ""}
                    onChange={(e) => setDraftField(service.id, "name", e.target.value)}
                  />
                  <Input
                    label="Açıklama"
                    value={drafts[service.id]?.description || ""}
                    onChange={(e) => setDraftField(service.id, "description", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Süre (dk)"
                      type="number"
                      value={drafts[service.id]?.duration || ""}
                      onChange={(e) => setDraftField(service.id, "duration", e.target.value)}
                    />
                    <Input
                      label="Fiyat (TL)"
                      type="number"
                      min={0}
                      value={drafts[service.id]?.price || ""}
                      onChange={(e) => setDraftField(service.id, "price", e.target.value)}
                    />
                  </div>
                  <ImageUpload
                    label="Hizmet Görseli"
                    folder="services"
                    value={drafts[service.id]?.image || ""}
                    onChange={(url) => setDraftField(service.id, "image", url)}
                    previewHeightClass="h-36"
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => saveService(service.id)}
                    disabled={savingId === service.id}
                  >
                    <Save className="w-4 h-4" />
                    {savingId === service.id ? "Kaydediliyor..." : "Hizmeti Kaydet"}
                  </Button>
                  <Button variant="danger" className="w-full" onClick={() => removeService(service.id, service.name)}>
                    <Trash2 className="w-4 h-4" />
                    Hizmeti Sil
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
