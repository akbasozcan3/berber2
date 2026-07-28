import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, customers, services, barbers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { confirmAllPendingAppointments } from "@/lib/services/appointment-confirm";
import { removeOrphanCustomers } from "@/lib/services/customers";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();

    const apts = await db.select().from(appointments).orderBy(desc(appointments.createdAt));
    const allCustomers = await db.select().from(customers);
    const allServices = await db.select().from(services);
    const allBarbers = await db.select().from(barbers);

    const enriched = apts.map((apt) => {
      const customer = allCustomers.find((c) => c.id === apt.customerId);
      const service = allServices.find((s) => s.id === apt.serviceId);
      const barber = allBarbers.find((b) => b.id === apt.barberId);
      return {
        id: apt.id,
        customerId: apt.customerId,
        customerName: customer?.name || "",
        phone: customer?.phone || "",
        email: customer?.email || "",
        serviceId: apt.serviceId,
        serviceName: service?.name || "",
        barberId: apt.barberId,
        barberName: barber?.name || "",
        date: apt.date,
        time: apt.time,
        duration: apt.duration,
        price: apt.price,
        status: apt.status,
        notes: apt.notes,
        createdAt: apt.createdAt,
      };
    });

    return jsonResponse(enriched);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDb();
    await requireAuth();
    const body = await parseBody<{ action?: string }>(request);

    if (body.action === "confirm_all") {
      const result = await confirmAllPendingAppointments();
      return jsonResponse({ success: true, ...result });
    }

    return errorResponse("Geçersiz işlem", 400);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function DELETE() {
  try {
    await ensureDb();
    await requireAuth();

    await db.delete(appointments);
    await removeOrphanCustomers();
    return jsonResponse({ success: true, cleared: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
