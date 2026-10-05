import { publicDbHandler } from "@/lib/api/helpers";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { M_STUDIO_SERVICES } from "@/lib/data/services-fallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return publicDbHandler(async () => {
    const list = await db
      .select()
      .from(services)
      .where(eq(services.enabled, true))
      .orderBy(services.sortOrder);
    return list.length > 0 ? list : M_STUDIO_SERVICES;
  }, M_STUDIO_SERVICES);
}
