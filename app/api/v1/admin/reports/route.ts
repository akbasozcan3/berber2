import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, customers, services, barbers } from "@/lib/db/schema";
import { ne } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();

    const allApts = await db.select().from(appointments).where(ne(appointments.status, "cancelled"));
    const completed = allApts.filter((a) => a.status === "completed");
    const serviceCounts: Record<string, number> = {};
    allApts.forEach((a) => {
      serviceCounts[a.serviceId] = (serviceCounts[a.serviceId] || 0) + 1;
    });

    const allServices = await db.select().from(services);
    const allBarbers = await db.select().from(barbers);
    const allCustomers = await db.select().from(customers);

    const popularServices = allServices
      .map((s) => ({ name: s.name, count: serviceCounts[s.id] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const barberStats = allBarbers.map((b) => {
      const bApts = allApts.filter((a) => a.barberId === b.id);
      return {
        name: b.name,
        appointments: bApts.length,
        revenue: bApts.filter((a) => a.status === "completed").reduce((s, a) => s + a.price, 0),
      };
    }).sort((a, b) => b.appointments - a.appointments);

    const hourCounts: Record<string, number> = {};
    allApts.forEach((a) => {
      const hour = a.time.slice(0, 2) + ":00";
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const busyHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    const revenueByMonth: Record<string, number> = {};
    completed.forEach((a) => {
      const m = a.date.slice(0, 7);
      revenueByMonth[m] = (revenueByMonth[m] || 0) + a.price;
    });

    const months = Object.keys(revenueByMonth).sort().slice(-7);
    const revenueChart = months.map((m) => ({
      month: new Date(m + "-01").toLocaleDateString("tr-TR", { month: "short" }),
      revenue: revenueByMonth[m],
      appointments: allApts.filter((a) => a.date.startsWith(m)).length,
    }));

    return jsonResponse({
      revenueChart,
      popularServices,
      barberStats,
      busyHours,
      totalCustomers: allCustomers.length,
      totalAppointments: allApts.length,
      totalRevenue: completed.reduce((s, a) => s + a.price, 0),
    });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
