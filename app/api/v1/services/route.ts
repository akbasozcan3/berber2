import { publicDbHandler } from "@/lib/api/helpers";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  return publicDbHandler(async () => {
    return db.select().from(services).where(eq(services.enabled, true)).orderBy(services.sortOrder);
  }, []);
}
