import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, and, gte, ne } from "drizzle-orm";
import { jsonResponse, errorResponse, EMPTY_DASHBOARD } from "@/lib/api/helpers";

function sumCompletedRevenue(rows: { status: string; price: number | null }[]) {
  return rows
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
}

export async function GET() {
  try {
    await requireAuth();

    if (!(await ensureDb())) {
      return jsonResponse(EMPTY_DASHBOARD);
    }

    const today = new Date().toISOString().split("T")[0];
    const monthStart = `${today.slice(0, 7)}-01`;

    const todayApts = await db.select().from(appointments).where(eq(appointments.date, today));
    const monthApts = await db
      .select()
      .from(appointments)
      .where(and(gte(appointments.date, monthStart), ne(appointments.status, "cancelled")));

    return jsonResponse({
      todayAppointments: todayApts.length,
      waitingCustomers: todayApts.filter((a) => a.status === "pending").length,
      completedToday: todayApts.filter((a) => a.status === "completed").length,
      revenueToday: sumCompletedRevenue(todayApts),
      revenueMonth: sumCompletedRevenue(monthApts),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return jsonResponse(EMPTY_DASHBOARD);
  }
}
