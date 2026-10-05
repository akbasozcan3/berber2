import PageHeader from "../components/ui/PageHeader";
import VideoShowcase from "../components/home/VideoShowcase";
import { getPublicSettingsSnapshot, getGalleryImages } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";
import { mapGalleryRow, filterVisibleGalleryItems } from "@/lib/utils/gallery";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(
    settings,
    settings.videosPageTitle || "Videolar & Reels",
    settings.videosPageSubtitle ||
      "Mehmet İis ve M Studio ekibinin en popüler saç kesimi, sakal tasarımı, dönüşüm ve VIP bakım videoları."
  );
}

export default async function VideolarPage() {
  const [settings, galleryRows] = await Promise.all([
    getPublicSettingsSnapshot(),
    getGalleryImages(),
  ]);

  const initialImages = filterVisibleGalleryItems(galleryRows.map(mapGalleryRow));

  return (
    <main>
      <PageHeader
        title={settings.videosPageTitle || "Videolar & Reels"}
        subtitle={
          settings.videosPageSubtitle ||
          "Mehmet İis ve M Studio Hairdresser'ın ustalıkla hazırlanan saç tasarım, sakal şekillendirme ve VIP bakım videoları."
        }
        breadcrumb={settings.navVideosLabel || "Videolar & Reels"}
        bg={settings.videosPageBanner || settings.galleryPageBanner || "/images/hero-1.jpg"}
      />
      <VideoShowcase initialGalleryItems={initialImages} />
    </main>
  );
}
