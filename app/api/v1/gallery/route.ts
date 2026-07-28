import { publicDbHandler } from "@/lib/api/helpers";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/db/schema";
import { mapGalleryRow, filterVisibleGalleryItems } from "@/lib/utils/gallery";

export async function GET() {
  return publicDbHandler(async () => {
    const data = await db.select().from(galleryImages).orderBy(galleryImages.sortOrder);
    return filterVisibleGalleryItems(data.map(mapGalleryRow));
  }, []);
}
