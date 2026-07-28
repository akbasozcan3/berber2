import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { settings, services, barbers, appointments } from "@/lib/db/schema";
import { jsonResponse } from "@/lib/api/helpers";
import { resolveDatabaseUrlFromEnv } from "@/lib/utils/load-local-env";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await ensureDb())) {
    return jsonResponse({
      ok: false,
      database: "disconnected",
      message: "DATABASE_URL tanımlı değil veya bağlantı kurulamadı.",
      hint: resolveDatabaseUrlFromEnv()
        ? "URL bulundu ama baglanti basarisiz — Vercel'de Redeploy yapin."
        : "Vercel Environment Variables'a DATABASE_URL ekleyin.",
    });
  }

  try {
    const [settingsRow] = await db.select({ count: sql<number>`count(*)` }).from(settings);
    const [servicesRow] = await db.select({ count: sql<number>`count(*)` }).from(services);
    const [barbersRow] = await db.select({ count: sql<number>`count(*)` }).from(barbers);
    const [appointmentsRow] = await db.select({ count: sql<number>`count(*)` }).from(appointments);

    return jsonResponse({
      ok: true,
      database: "connected",
      tables: {
        settings: Number(settingsRow?.count ?? 0),
        services: Number(servicesRow?.count ?? 0),
        barbers: Number(barbersRow?.count ?? 0),
        appointments: Number(appointmentsRow?.count ?? 0),
      },
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      database: "error",
      message: err instanceof Error ? err.message : "Sorgu hatası",
    });
  }
}
