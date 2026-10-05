import PageHeader from "../components/ui/PageHeader";
import Gallery from "../components/gallery/Gallery";
import { getGalleryImages, getPublicSettingsSnapshot } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";
import { mapGalleryRow, filterVisibleGalleryItems } from "@/lib/utils/gallery";
import { M_STUDIO_GALLERY_FALLBACK } from "@/lib/data/gallery-fallback";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(settings, settings.galleryPageTitle, settings.galleryPageSubtitle);
}

export default async function GaleriPage() {
  const [settings, galleryRows] = await Promise.all([
    getPublicSettingsSnapshot(),
    getGalleryImages(),
  ]);

  const mapped = filterVisibleGalleryItems(galleryRows.map(mapGalleryRow));
  const initialImages = mapped.length > 0 ? mapped : M_STUDIO_GALLERY_FALLBACK;

  return (
    <main>
      <PageHeader
        title={settings.galleryPageTitle}
        subtitle={settings.galleryPageSubtitle}
        bg={settings.galleryPageBanner}
      />
      <Gallery initialImages={initialImages} />
    </main>
  );
}
