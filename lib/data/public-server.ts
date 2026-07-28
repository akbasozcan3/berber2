import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { reviews, services, galleryImages, barbers, heroSlides, pageContent } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getPublicSettingsServer } from "@/lib/data/public-settings";
import type { PageContent } from "@/lib/api/client";

export async function getApprovedReviews(limit = 50) {
  try {
    if (!(await ensureDb())) return [];
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.approved, true))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getFeaturedReviews(limit = 8) {
  try {
    if (!(await ensureDb())) return [];
    const featured = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.approved, true), eq(reviews.featured, true)))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);

    if (featured.length > 0) return featured;
    return getApprovedReviews(limit);
  } catch {
    return [];
  }
}

export async function getPopularServices(limit = 4) {
  try {
    if (!(await ensureDb())) return [];
    return await db
      .select()
      .from(services)
      .where(eq(services.enabled, true))
      .orderBy(services.sortOrder)
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getEnabledServices() {
  try {
    if (!(await ensureDb())) return [];
    return await db
      .select()
      .from(services)
      .where(eq(services.enabled, true))
      .orderBy(services.sortOrder);
  } catch {
    return [];
  }
}

export async function getGalleryImages(limit?: number) {
  try {
    if (!(await ensureDb())) return [];
    const query = db.select().from(galleryImages).orderBy(galleryImages.sortOrder);
    return typeof limit === "number" ? await query.limit(limit) : await query;
  } catch {
    return [];
  }
}

export async function getEnabledHeroSlides() {
  try {
    if (!(await ensureDb())) return [];
    return await db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.enabled, true))
      .orderBy(heroSlides.sortOrder);
  } catch {
    return [];
  }
}

function parseJsonField<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getPageContentBySlug(slug: string): Promise<PageContent | null> {
  try {
    if (!(await ensureDb())) return null;
    const rows = await db.select().from(pageContent).where(eq(pageContent.slug, slug)).limit(1);
    const page = rows[0];
    if (!page) return null;

    return {
      slug: page.slug,
      title: page.title,
      subtitle: page.subtitle,
      heroImage: page.heroImage,
      content: page.content,
      sections: parseJsonField(page.sections, []),
      meta: parseJsonField(page.meta, null),
      updatedAt: page.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function getAvailableBarbers() {
  try {
    if (!(await ensureDb())) return [];
    return await db
      .select()
      .from(barbers)
      .where(and(eq(barbers.available, true), eq(barbers.onVacation, false)))
      .orderBy(barbers.sortOrder);
  } catch {
    return [];
  }
}

export async function getPublicSettingsSnapshot() {
  return getPublicSettingsServer();
}
