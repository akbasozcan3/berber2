import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { pageContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse, safeJsonParse } from "@/lib/api/helpers";

export async function GET(request: Request) {
  try {
    if (!(await ensureDb())) {
      return errorResponse("Sayfa bulunamadı", 404);
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "about";
    const page = await db.select().from(pageContent).where(eq(pageContent.slug, slug)).limit(1);
    if (!page[0]) return errorResponse("Sayfa bulunamadı", 404);

    const p = page[0];
    return jsonResponse({
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      heroImage: p.heroImage,
      content: p.content,
      sections: safeJsonParse(p.sections, []),
      meta: safeJsonParse(p.meta, null),
      updatedAt: p.updatedAt,
    });
  } catch {
    return errorResponse("Sayfa bulunamadı", 404);
  }
}
