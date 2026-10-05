import type { GalleryImage } from "@/lib/api/client";

export function mapGalleryRow(
  g: {
    id: number;
    url: string;
    title: string;
    mediaType?: string | null;
    instagramUrl?: string | null;
    coverUrl?: string | null;
    isVideo?: boolean | null;
    sortOrder: number;
    createdAt: string;
  }
): GalleryImage {
  const rawType = (g.mediaType || "").toLowerCase();
  const mediaType: "image" | "instagram" | "tiktok" =
    rawType === "instagram" ? "instagram" : rawType === "tiktok" ? "tiktok" : "image";

  return {
    id: g.id,
    url: g.url,
    title: g.title,
    mediaType,
    instagramUrl: g.instagramUrl ?? null,
    coverUrl: g.coverUrl ?? null,
    isVideo: Boolean(g.isVideo),
    sortOrder: g.sortOrder,
    createdAt: g.createdAt,
  };
}

export function getGalleryDisplayUrl(item: Pick<GalleryImage, "url" | "coverUrl">): string {
  const cover = item.coverUrl?.trim();
  const url = item.url?.trim();
  return cover || url || "";
}

export function isGalleryItemVisible(item: GalleryImage): boolean {
  return Boolean(getGalleryDisplayUrl(item));
}

export function filterVisibleGalleryItems(items: GalleryImage[]): GalleryImage[] {
  return items.filter(isGalleryItemVisible);
}

export function isInstagramGalleryItem(
  item: Pick<GalleryImage, "mediaType" | "instagramUrl">
): boolean {
  return item.mediaType === "instagram" && Boolean(item.instagramUrl?.trim());
}

export function isTikTokGalleryItem(
  item: Pick<GalleryImage, "mediaType" | "instagramUrl">
): boolean {
  return item.mediaType === "tiktok" && Boolean(item.instagramUrl?.trim());
}

export function getGalleryItemLink(item: GalleryImage): string | null {
  if (isInstagramGalleryItem(item) || isTikTokGalleryItem(item)) {
    return item.instagramUrl!.trim();
  }
  return null;
}

export function normalizeInstagramPostUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("instagram.com") || trimmed.startsWith("www.instagram.com")) {
    return `https://${trimmed.replace(/^www\./, "")}`;
  }
  return trimmed;
}

export function isValidInstagramPostUrl(url: string): boolean {
  const normalized = normalizeInstagramPostUrl(url);
  return /instagram\.com\/(p|reel|reels|tv|[\w.-]+)/i.test(normalized);
}

export function normalizeTikTokPostUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("tiktok.com") || trimmed.startsWith("www.tiktok.com")) {
    return `https://${trimmed.replace(/^www\./, "")}`;
  }
  if (trimmed.startsWith("@")) {
    return `https://www.tiktok.com/${trimmed}`;
  }
  return trimmed;
}

export function isValidTikTokPostUrl(url: string): boolean {
  const normalized = normalizeTikTokPostUrl(url);
  return normalized.includes("tiktok.com");
}
