import { z } from "zod";
import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody, publicDbHandler } from "@/lib/api/helpers";
import { createNotification } from "@/lib/services/notifications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");
  const approved = searchParams.get("approved") !== "false";

  return publicDbHandler(async () => {
    if (approved) {
      const data = await db
        .select()
        .from(reviews)
        .where(eq(reviews.approved, true))
        .orderBy(desc(reviews.createdAt));
      return featured === "true" ? data.filter((r) => r.featured) : data;
    }
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }, []);
}

const reviewSchema = z.object({
  customerName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  customerEmail: z.string().email("Geçerli bir e-posta adresi girin."),
  rating: z.number().min(1).max(5),
  review: z.string().min(10, "Yorum en az 10 karakter olmalıdır."),
});

export async function POST(request: Request) {
  try {
    if (!(await ensureDb())) {
      return errorResponse("Yorum gönderilemedi.", 503);
    }
    const body = await parseBody<unknown>(request);
    const data = reviewSchema.parse(body);

    const [newReview] = await db
      .insert(reviews)
      .values({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        rating: data.rating,
        review: data.review,
        source: "website",
        featured: false,
        approved: false,
        replied: false,
        createdAt: new Date().toISOString(),
      })
      .returning();

    await createNotification({
      type: "review",
      title: "Yeni Yorum",
      message: `${data.customerName} - ${data.rating} yıldız`,
      meta: { reviewId: newReview.id },
    });

    return jsonResponse({ success: true, review: newReview }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Geçersiz veri.");
    }
    return errorResponse("Yorum gönderilemedi.", 500);
  }
}
