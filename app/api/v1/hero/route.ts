import { publicDbHandler } from "@/lib/api/helpers";
import { db } from "@/lib/db";
import { heroSlides } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  return publicDbHandler(async () => {
    return db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.enabled, true))
      .orderBy(heroSlides.sortOrder);
  }, []);
}
