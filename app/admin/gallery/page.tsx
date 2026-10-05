"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Save, Trash2, Video } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Select from "@/components/admin/ui/Select";
import Toggle from "@/components/admin/ui/Toggle";
import ImageUpload from "@/components/admin/ui/ImageUpload";
import Tabs from "@/components/admin/ui/Tabs";
import Badge from "@/components/admin/ui/Badge";
import { adminApi, type AdminGallery } from "@/lib/api/admin";
import {
  getGalleryDisplayUrl,
  isValidInstagramPostUrl,
  normalizeInstagramPostUrl,
  isValidTikTokPostUrl,
  normalizeTikTokPostUrl,
} from "@/lib/utils/gallery";

type GalleryDraft = {
  title: string;
  url: string;
  mediaType: "image" | "instagram" | "tiktok";
  instagramUrl: string;
  coverUrl: string;
  isVideo: boolean;
};

const emptyDraft = (): GalleryDraft => ({
  title: "",
  url: "",
  mediaType: "image",
  instagramUrl: "",
  coverUrl: "",
  isVideo: false,
});

function toDraft(item: AdminGallery): GalleryDraft {
  const mType = (item.mediaType as "image" | "instagram" | "tiktok") || "image";
  return {
    title: item.title,
    url: item.url,
    mediaType: mType,
    instagramUrl: item.instagramUrl || "",
    coverUrl: item.coverUrl || "",
    isVideo: item.isVideo,
  };
}

export default function GalleryPage() {
  const [images, setImages] = useState<AdminGallery[]>([]);
  const [drafts, setDrafts] = useState<Record<number, GalleryDraft>>({});
  const [newItem, setNewItem] = useState<GalleryDraft>(emptyDraft());
  const [addMode, setAddMode] = useState<"image" | "instagram" | "tiktok">("instagram");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const load = () => {
    adminApi.getGallery().then((list) => {
      setImages(list);
      setDrafts(Object.fromEntries(list.map((i) => [i.id, toDraft(i)])));
    });
  };

  useEffect(() => {
    load();
  }, []);

  const validateDraft = (d: GalleryDraft): string | null => {
    if (!d.title.trim()) return "Başlık gerekli.";
    if (d.mediaType === "instagram") {
      const ig = normalizeInstagramPostUrl(d.instagramUrl);
      if (!ig) return "Instagram linki gerekli.";
      if (!isValidInstagramPostUrl(ig)) {
        return "Geçerli bir Instagram linki girin (örn: https://www.instagram.com/mstudiohairdresser/).";
      }
      const thumb = d.coverUrl.trim() || d.url.trim();
      if (!thumb) return "Kapak görseli yükleyin (video için zorunlu).";
      if (d.isVideo && !d.coverUrl.trim()) return "Video içerikler için kapak görseli zorunludur.";
    } else if (d.mediaType === "tiktok") {
      const tt = normalizeTikTokPostUrl(d.instagramUrl);
      if (!tt) return "TikTok video veya profil linki gerekli.";
      if (!isValidTikTokPostUrl(tt)) {
        return "Geçerli bir TikTok linki girin (örn: https://www.tiktok.com/@mehmetiis).";
      }
      const thumb = d.coverUrl.trim() || d.url.trim();
      if (!thumb) return "TikTok videosu için kapak görseli yükleyin.";
    } else if (!d.url.trim()) {
      return "Görsel yükleyin.";
    }
    return null;
  };

  const payloadFromDraft = (d: GalleryDraft, sortOrder: number) => {
    const cover = d.coverUrl.trim();
    const url = d.mediaType !== "image" ? cover || d.url.trim() : d.url.trim();
    let socialUrl: string | null = null;
    if (d.mediaType === "instagram") {
      socialUrl = normalizeInstagramPostUrl(d.instagramUrl);
    } else if (d.mediaType === "tiktok") {
      socialUrl = normalizeTikTokPostUrl(d.instagramUrl);
    }

    return {
      title: d.title.trim(),
      url,
      sortOrder,
      mediaType: d.mediaType,
      instagramUrl: socialUrl,
      coverUrl: cover || null,
      isVideo: d.mediaType === "tiktok" ? true : d.mediaType === "instagram" ? d.isVideo : false,
    };
  };

  const saveImage = async (id: number) => {
    const d = drafts[id];
    if (!d) return;
    const err = validateDraft(d);
    if (err) {
      showToast(err);
      return;
    }
    await adminApi.updateGallery(id, payloadFromDraft(d, images.find((i) => i.id === id)?.sortOrder || 0));
    showToast("Kaydedildi.");
    load();
  };

  const addImage = async () => {
    const draft = {
      ...newItem,
      mediaType: addMode,
      isVideo: addMode === "tiktok" ? true : newItem.isVideo,
    };
    const err = validateDraft(draft);
    if (err) {
      showToast(err);
      return;
    }
    await adminApi.createGallery(payloadFromDraft(draft, images.length + 1));
    setNewItem(emptyDraft());
    showToast(
      addMode === "instagram"
        ? "Instagram içeriği eklendi."
        : addMode === "tiktok"
        ? "TikTok videosu eklendi."
        : "Görsel eklendi."
    );
    load();
  };

  const removeImage = async (id: number) => {
    await adminApi.deleteGallery(id);
    showToast("Silindi.");
    load();
  };

  const updateDraft = (id: number, patch: Partial<GalleryDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyDraft()), ...patch },
    }));
  };

  const instagramCount = images.filter((i) => i.mediaType === "instagram").length;
  const tiktokCount = images.filter((i) => i.mediaType === "tiktok").length;
  const imageCount = images.filter((i) => i.mediaType === "image" || !i.mediaType).length;

  return (
    <div>
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm max-w-sm">
          {toast}
        </div>
      )}

      <PageHeader
        title="Galeri, Instagram Reels & TikTok Videoları"
        description="M Studio Hairdresser ve Mehmet İis videoları, Instagram & TikTok paylaşımları ve stüdyo görselleri."
      />

      <Card className="mb-6">
        <Tabs
          className="mb-6 w-fit"
          tabs={[
            { id: "instagram", label: "Instagram Reel / Post", count: instagramCount },
            { id: "tiktok", label: "TikTok Video", count: tiktokCount },
            { id: "image", label: "Salon Görseli", count: imageCount },
          ]}
          activeTab={addMode}
          onChange={(id) => setAddMode(id as "image" | "instagram" | "tiktok")}
        />

        {addMode === "instagram" ? (
          <div className="space-y-5">
            <Input
              label="Başlık"
              placeholder="Örn: Skin Fade & Saç Tasarımı - Mehmet İis"
              value={newItem.title}
              onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
            />
            <Input
              label="Instagram Gönderi / Reel Linki"
              placeholder="https://www.instagram.com/reel/... veya https://www.instagram.com/mstudiohairdresser/"
              value={newItem.instagramUrl}
              onChange={(e) => setNewItem((p) => ({ ...p, instagramUrl: e.target.value }))}
            />
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0D1117] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#F8F8F8]">Video / Reel içeriği</p>
                <p className="text-xs text-[#71717A] mt-0.5">Açıksa kapak görseli zorunludur.</p>
              </div>
              <Toggle
                checked={newItem.isVideo}
                onChange={(checked) => setNewItem((p) => ({ ...p, isVideo: checked }))}
              />
            </div>
            <ImageUpload
              label={newItem.isVideo ? "Kapak Görseli (zorunlu)" : "Kapak / Önizleme Görseli"}
              folder="gallery"
              value={newItem.coverUrl || newItem.url}
              onChange={(url) => setNewItem((p) => ({ ...p, coverUrl: url, url }))}
            />
          </div>
        ) : addMode === "tiktok" ? (
          <div className="space-y-5">
            <Input
              label="Başlık"
              placeholder="Örn: Sakal Heykeltıraşlığı & Geçiş - Mehmet İis"
              value={newItem.title}
              onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
            />
            <Input
              label="TikTok Video / Profil Linki"
              placeholder="https://www.tiktok.com/@mehmetiis veya video linki"
              value={newItem.instagramUrl}
              onChange={(e) => setNewItem((p) => ({ ...p, instagramUrl: e.target.value }))}
            />
            <p className="text-xs text-[#71717A]">
              TikTok içerikleri sitede video olarak listelenir ve direkt olarak Mehmet İis TikTok profiline bağlanır.
            </p>
            <ImageUpload
              label="Video Kapak / Önizleme Görseli (zorunlu)"
              folder="gallery"
              value={newItem.coverUrl || newItem.url}
              onChange={(url) => setNewItem((p) => ({ ...p, coverUrl: url, url, isVideo: true }))}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Başlık"
              placeholder="Örn: Salon İç Mekan & Berber Koltuğu"
              value={newItem.title}
              onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
            />
            <ImageUpload
              label="Görsel"
              folder="gallery"
              value={newItem.url}
              onChange={(url) => setNewItem((p) => ({ ...p, url }))}
            />
          </div>
        )}

        <Button onClick={addImage} className="mt-5">
          <Plus className="w-4 h-4" />
          {addMode === "instagram"
            ? "Instagram İçeriği Ekle"
            : addMode === "tiktok"
            ? "TikTok Videosu Ekle"
            : "Görsel Ekle"}
        </Button>
      </Card>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {images.map((img) => {
          const d = drafts[img.id] ?? toDraft(img);
          const preview = getGalleryDisplayUrl({
            url: d.url || img.url,
            coverUrl: d.coverUrl || img.coverUrl,
          });
          const missingCover = !preview;

          return (
            <Card
              key={img.id}
              padding="none"
              className={`mb-4 break-inside-avoid overflow-hidden ${
                missingCover ? "ring-1 ring-red-500/40" : ""
              }`}
            >
              <div className="relative h-56 bg-[#141E2E]">
                {preview ? (
                  <Image src={preview} alt={d.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {d.mediaType === "tiktok" ? (
                      <TikTokIcon size={32} className="text-white/20" />
                    ) : d.mediaType === "instagram" ? (
                      <InstagramIcon size={32} className="text-white/20" />
                    ) : (
                      <Video size={32} className="text-white/20" />
                    )}
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {d.mediaType === "tiktok" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#000000]/80 text-[#25F4EE] border border-[#FE2C55]/30 backdrop-blur-sm">
                      <TikTokIcon size={11} />
                      TikTok Video
                    </span>
                  ) : d.mediaType === "instagram" ? (
                    <Badge
                      variant="gold"
                      label={d.isVideo ? "Instagram Reel" : "Instagram Post"}
                    />
                  ) : (
                    <Badge variant="default" label="Görsel" />
                  )}
                </div>
              </div>
              {missingCover && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-300 text-xs">
                  Kapak görseli eksik — bu içerik sitede görünmez. Görsel yükleyip kaydedin.
                </div>
              )}
              <div className="p-4 space-y-3">
                <Select
                  label="İçerik Türü"
                  value={d.mediaType}
                  onChange={(e) =>
                    updateDraft(img.id, {
                      mediaType: e.target.value as "image" | "instagram" | "tiktok",
                      isVideo:
                        e.target.value === "tiktok"
                          ? true
                          : e.target.value === "image"
                          ? false
                          : d.isVideo,
                    })
                  }
                  options={[
                    { value: "image", label: "Salon Görseli" },
                    { value: "instagram", label: "Instagram Post / Reel" },
                    { value: "tiktok", label: "TikTok Videosu" },
                  ]}
                />
                <Input
                  label="Başlık"
                  value={d.title}
                  onChange={(e) => updateDraft(img.id, { title: e.target.value })}
                />
                {d.mediaType === "instagram" ? (
                  <>
                    <Input
                      label="Instagram Linki"
                      value={d.instagramUrl}
                      onChange={(e) => updateDraft(img.id, { instagramUrl: e.target.value })}
                    />
                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0D1117] px-4 py-3">
                      <p className="text-sm text-[#A1A1AA]">Video / Reel</p>
                      <Toggle
                        checked={d.isVideo}
                        onChange={(checked) => updateDraft(img.id, { isVideo: checked })}
                      />
                    </div>
                    <ImageUpload
                      label={d.isVideo ? "Kapak Görseli" : "Önizleme Görseli"}
                      folder="gallery"
                      value={d.coverUrl || d.url}
                      onChange={(url) => updateDraft(img.id, { coverUrl: url, url })}
                      previewHeightClass="h-32"
                    />
                  </>
                ) : d.mediaType === "tiktok" ? (
                  <>
                    <Input
                      label="TikTok Video / Profil Linki"
                      value={d.instagramUrl}
                      onChange={(e) => updateDraft(img.id, { instagramUrl: e.target.value })}
                    />
                    <ImageUpload
                      label="Video Kapak Görseli"
                      folder="gallery"
                      value={d.coverUrl || d.url}
                      onChange={(url) => updateDraft(img.id, { coverUrl: url, url, isVideo: true })}
                      previewHeightClass="h-32"
                    />
                  </>
                ) : (
                  <ImageUpload
                    label="Görsel"
                    folder="gallery"
                    value={d.url}
                    onChange={(url) => updateDraft(img.id, { url })}
                    previewHeightClass="h-32"
                  />
                )}
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => saveImage(img.id)} className="flex-1">
                    <Save className="w-4 h-4" />
                    Kaydet
                  </Button>
                  <Button variant="danger" onClick={() => removeImage(img.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
