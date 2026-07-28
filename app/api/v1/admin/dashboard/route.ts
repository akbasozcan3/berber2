import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, and, sql, ne } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();

    const today = new Date().toISOString().split("T")[0];
    const monthStart = today.slice(0, 7) + "-01";

    const todayApts = await db.select().from(appointments).where(eq(appointments.date, today));
    const monthApts = await db
      .select()
      .from(appointments)
      .where(and(sql`${appointments.date} >= ${monthStart}`, ne(appointments.status, "cancelled")));

    const revenueToday = todayApts
      .filter((a) => a.status === "completed")
      .reduce((sum, a) => sum + a.price, 0);
    const revenueMonth = monthApts
      .filter((a) => a.status === "completed")
      .reduce((sum, a) => sum + a.price, 0);

    return jsonResponse({
      todayAppointments: todayApts.length,
      waitingCustomers: todayApts.filter((a) => a.status === "pending").length,
      completedToday: todayApts.filter((a) => a.status === "completed").length,
      revenueToday,
      revenueMonth,
    });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
