import { publicDbHandler } from "@/lib/api/helpers";
import { db } from "@/lib/db";
import { barbers } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET() {
  return publicDbHandler(async () => {
    return db
      .select()
      .from(barbers)
      .where(and(eq(barbers.available, true), eq(barbers.onVacation, false)))
      .orderBy(barbers.sortOrder);
  }, []);
}
