import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  barbers,
  services,
  customers,
  reviews,
  galleryImages,
  settings,
  barberServices,
  appointments,
  availabilityBlocks,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { getSettings } from "@/lib/services/booking";
import { normalizePhoneStorage } from "@/lib/utils/format";
import { revalidatePath } from "next/cache";
import { normalizeInstagramPostUrl } from "@/lib/utils/gallery";
import { MULTILINE_SETTING_KEYS, normalizeMultilineSettingValue } from "@/lib/data/multiline-settings";
import { parseWorkingHoursJson, serializeWorkingHours } from "@/lib/data/working-hours";
import { normalizeBarberWorkingDays, BARBER_WORKING_DAYS } from "@/lib/utils/salon-schedule";
import { z } from "zod";

function revalidateGalleryPages() {
  revalidatePath("/", "layout");
  revalidatePath("/galeri");
}

function parseGalleryPayload(body: Record<string, unknown>) {
  const mediaType = body.mediaType === "instagram" ? "instagram" : "image";
  const instagramUrl = body.instagramUrl ? normalizeInstagramPostUrl(String(body.instagramUrl)) : null;
  const coverUrl = body.coverUrl ? String(body.coverUrl).trim() : null;
  const isVideo = Boolean(body.isVideo);
  const url = String(body.url || coverUrl || "").trim();

  return { mediaType, instagramUrl, coverUrl, isVideo, url };
}


type Entity = "barbers" | "services" | "customers" | "reviews" | "gallery" | "settings";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { entity } = await params;

    switch (entity as Entity) {
      case "barbers":
        return jsonResponse(await db.select().from(barbers).orderBy(barbers.sortOrder));
      case "services":
        return jsonResponse(await db.select().from(services).orderBy(services.sortOrder));
      case "customers":
        return jsonResponse(await db.select().from(customers).orderBy(desc(customers.createdAt)));
      case "reviews":
        return jsonResponse(await db.select().from(reviews).orderBy(desc(reviews.createdAt)));
      case "gallery":
        return jsonResponse(await db.select().from(galleryImages).orderBy(galleryImages.sortOrder));
      case "settings":
        return jsonResponse(await getSettings());
      default:
        return errorResponse("Geçersiz entity", 404);
    }
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { entity } = await params;
    const body = await parseBody<Record<string, unknown>>(request);

    if (entity === "reviews" && body.id) {
      const reviewPatchSchema = z.object({
        id: z.coerce.number(),
        customerName: z.string().min(2).optional(),
        customerEmail: z.string().email().nullable().optional(),
        rating: z.coerce.number().int().min(1).max(5).optional(),
        review: z.string().min(10).optional(),
        source: z.enum(["google", "website"]).optional(),
        approved: z.boolean().optional(),
        featured: z.boolean().optional(),
        reply: z.string().nullable().optional(),
      });

      const parsed = reviewPatchSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(parsed.error.issues[0]?.message || "Geçersiz veri.", 400);
      }

      const data = parsed.data;
      const id = data.id;
      const updates: Record<string, unknown> = {};

      if (data.customerName !== undefined) updates.customerName = data.customerName;
      if (data.customerEmail !== undefined) updates.customerEmail = data.customerEmail;
      if (data.rating !== undefined) updates.rating = data.rating;
      if (data.review !== undefined) updates.review = data.review;
      if (data.source !== undefined) updates.source = data.source;
      if (data.approved !== undefined) updates.approved = data.approved;
      if (data.featured !== undefined) updates.featured = data.featured;
      if (data.reply !== undefined) {
        updates.reply = data.reply;
        updates.replied = true;
      }

      await db.update(reviews).set(updates).where(eq(reviews.id, id));
      return jsonResponse({ success: true });
    }

    if (entity === "barbers" && body.id) {
      const id = Number(body.id);
      const updates = { ...body };
      delete updates.id;
      if (typeof updates.workingDays === "string") {
        updates.workingDays = normalizeBarberWorkingDays(updates.workingDays);
      }
      await db.update(barbers).set(updates as Partial<typeof barbers.$inferInsert>).where(eq(barbers.id, id));
      revalidatePath("/", "layout");
      revalidatePath("/");
      return jsonResponse({ success: true });
    }

    if (entity === "services" && body.id) {
      const id = Number(body.id);
      const updates = { ...body };
      delete updates.id;
      await db.update(services).set(updates as Partial<typeof services.$inferInsert>).where(eq(services.id, id));
      return jsonResponse({ success: true });
    }

    if (entity === "gallery" && body.id) {
      const id = Number(body.id);
      const raw = { ...body };
      delete raw.id;
      const parsed = parseGalleryPayload(raw);
      const title = raw.title !== undefined ? String(raw.title).trim() : undefined;
      const sortOrder = raw.sortOrder !== undefined ? Number(raw.sortOrder) : undefined;

      if (parsed.mediaType === "instagram") {
        if (!parsed.instagramUrl) return errorResponse("Instagram gönderi linki gerekli", 400);
        if (!parsed.url) return errorResponse("Kapak görseli gerekli", 400);
        if (parsed.isVideo && !parsed.coverUrl) {
          return errorResponse("Video içerikler için kapak görseli zorunludur", 400);
        }
      } else if (raw.url !== undefined && !parsed.url) {
        return errorResponse("Görsel URL gerekli", 400);
      }

      const updates: Partial<typeof galleryImages.$inferInsert> = {
        mediaType: parsed.mediaType,
        instagramUrl: parsed.mediaType === "instagram" ? parsed.instagramUrl : null,
        coverUrl: parsed.coverUrl,
        isVideo: parsed.mediaType === "instagram" ? parsed.isVideo : false,
      };

      if (raw.url !== undefined || raw.coverUrl !== undefined) updates.url = parsed.url;
      if (title !== undefined) updates.title = title || "Galeri";
      if (sortOrder !== undefined) updates.sortOrder = sortOrder;

      await db.update(galleryImages).set(updates).where(eq(galleryImages.id, id));
      revalidateGalleryPages();
      return jsonResponse({ success: true });
    }

    if (entity === "settings") {
      for (const [key, value] of Object.entries(body)) {
        if (key === "notifications_telegram") continue;
        let stored = key === "phone" ? normalizePhoneStorage(String(value)) : String(value);
        if (MULTILINE_SETTING_KEYS.includes(key as (typeof MULTILINE_SETTING_KEYS)[number])) {
          stored = normalizeMultilineSettingValue(stored);
        }
        if (key === "working_hours") {
          stored = serializeWorkingHours(parseWorkingHoursJson(stored));
        }
        const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
        if (existing[0]) {
          await db.update(settings).set({ value: stored }).where(eq(settings.key, key));
        } else {
          await db.insert(settings).values({ key, value: stored });
        }
      }

      const telegramFlag = await db.select().from(settings).where(eq(settings.key, "notifications_telegram")).limit(1);
      if (telegramFlag[0]) {
        await db.update(settings).set({ value: "true" }).where(eq(settings.key, "notifications_telegram"));
      } else {
        await db.insert(settings).values({ key: "notifications_telegram", value: "true" });
      }

      revalidatePath("/", "layout");
      ["/", "/iletisim", "/randevu", "/hakkimizda", "/hizmetler", "/galeri", "/yorumlar"].forEach(
        (path) => revalidatePath(path)
      );

      return jsonResponse({ success: true });
    }

    return errorResponse("Geçersiz güncelleme", 400);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { entity } = await params;
    const body = await parseBody<Record<string, unknown>>(request);

    if (entity === "barbers") {
      const [created] = await db
        .insert(barbers)
        .values({
          name: String(body.name || ""),
          slug: String(body.slug || "").trim().toLowerCase(),
          position: String(body.position || "Berber"),
          avatar: body.avatar ? String(body.avatar) : null,
          specialty: body.specialty ? String(body.specialty) : null,
          workingDays: normalizeBarberWorkingDays(String(body.workingDays || BARBER_WORKING_DAYS)),
          workingStart: String(body.workingStart || "09:00"),
          workingEnd: String(body.workingEnd || "22:00"),
          onVacation: false,
          available: true,
          performance: Number(body.performance || 95),
          sortOrder: Number(body.sortOrder || 0),
          createdAt: new Date().toISOString(),
        })
        .returning();
      return jsonResponse(created, 201);
    }

    if (entity === "gallery") {
      const parsed = parseGalleryPayload(body);

      if (!parsed.url) return errorResponse("Kapak görseli veya görsel URL gerekli", 400);
      if (parsed.mediaType === "instagram" && !parsed.instagramUrl) {
        return errorResponse("Instagram gönderi linki gerekli", 400);
      }
      if (parsed.mediaType === "instagram" && parsed.isVideo && !parsed.coverUrl) {
        return errorResponse("Video içerikler için kapak görseli zorunludur", 400);
      }

      const [created] = await db
        .insert(galleryImages)
        .values({
          url: parsed.url,
          title: String(body.title || "Galeri"),
          mediaType: parsed.mediaType,
          instagramUrl: parsed.mediaType === "instagram" ? parsed.instagramUrl : null,
          coverUrl: parsed.coverUrl,
          isVideo: parsed.mediaType === "instagram" ? parsed.isVideo : false,
          sortOrder: Number(body.sortOrder || 0),
          createdAt: new Date().toISOString(),
        })
        .returning();
      revalidateGalleryPages();
      return jsonResponse(created, 201);
    }

    if (entity === "services") {
      const name = String(body.name || "").trim();
      if (!name) return errorResponse("Hizmet adı gerekli", 400);
      const slug =
        String(body.slug || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || `hizmet-${Date.now()}`;
      const [created] = await db
        .insert(services)
        .values({
          name,
          slug,
          description: String(body.description || ""),
          duration: Number(body.duration || 30),
          price: Number(body.price || 0),
          image: body.image ? String(body.image) : null,
          popular: Boolean(body.popular),
          enabled: body.enabled !== false,
          sortOrder: Number(body.sortOrder || 0),
          createdAt: new Date().toISOString(),
        })
        .returning();
      return jsonResponse(created, 201);
    }

    return errorResponse("Geçersiz oluşturma isteği", 400);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Oluşturulamadı", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { entity } = await params;
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) return errorResponse("ID gerekli", 400);

    if (entity === "barbers") {
      // FK kısıtları yüzünden önce ilişkili kayıtları temizlemeliyiz.
      // (barber_services -> barbers), (appointments -> barbers) ve (availability_blocks -> barbers)
      await db.delete(barberServices).where(eq(barberServices.barberId, id));
      await db.update(appointments).set({ barberId: null }).where(eq(appointments.barberId, id));
      await db.delete(availabilityBlocks).where(eq(availabilityBlocks.barberId, id));
      await db.delete(barbers).where(eq(barbers.id, id));
      return jsonResponse({ success: true });
    }
    if (entity === "gallery") {
      await db.delete(galleryImages).where(eq(galleryImages.id, id));
      revalidateGalleryPages();
      return jsonResponse({ success: true });
    }
    if (entity === "reviews") {
      await db.delete(reviews).where(eq(reviews.id, id));
      return jsonResponse({ success: true });
    }
    if (entity === "services") {
      const linked = await db.select().from(appointments).where(eq(appointments.serviceId, id)).limit(1);
      if (linked.length > 0) {
        return errorResponse("Bu hizmete bağlı randevular var. Önce pasif yapın veya randevuları silin.", 400);
      }
      await db.delete(barberServices).where(eq(barberServices.serviceId, id));
      await db.delete(services).where(eq(services.id, id));
      return jsonResponse({ success: true });
    }
    return errorResponse("Geçersiz silme isteği", 400);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
