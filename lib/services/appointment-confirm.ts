import { db } from "@/lib/db";
import { appointments, customers, services, barbers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cleanupOrphanCustomer } from "@/lib/services/customers";
import { getSetting } from "./booking";
import {
  sendAppointmentConfirmedEmail,
  sendAppointmentCancelledEmail,
  type EmailResult,
} from "./email";
import { resolvePublicSiteUrl } from "@/lib/utils/site-url";

type AppointmentRow = {
  appointment: typeof appointments.$inferSelect;
  customer: typeof customers.$inferSelect;
  service: typeof services.$inferSelect;
  barber: typeof barbers.$inferSelect | null;
};

export async function loadEmailBranding() {
  const [businessName, address, phone, siteUrlSetting, logoUrl] = await Promise.all([
    getSetting("business_name"),
    getSetting("address"),
    getSetting("phone"),
    getSetting("site_url"),
    getSetting("logo_url"),
  ]);

  return {
    businessName: businessName?.trim() || "M Studio Hairdresser",
    address: address || undefined,
    phone: phone || undefined,
    siteUrl: resolvePublicSiteUrl(siteUrlSetting),
    logoUrl: logoUrl || undefined,
  };
}

export async function fetchAppointmentRow(appointmentId: number): Promise<AppointmentRow | null> {
  const rows = await db
    .select({
      appointment: appointments,
      customer: customers,
      service: services,
      barber: barbers,
    })
    .from(appointments)
    .innerJoin(customers, eq(appointments.customerId, customers.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(barbers, eq(appointments.barberId, barbers.id))
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  return rows[0] ?? null;
}

export async function confirmAppointmentWithEmail(
  appointmentId: number,
  branding?: Awaited<ReturnType<typeof loadEmailBranding>>
): Promise<{ email: EmailResult | null }> {
  const row = await fetchAppointmentRow(appointmentId);
  if (!row) throw new Error("Randevu bulunamadı");

  const previousStatus = row.appointment.status;
  if (previousStatus === "confirmed") {
    return { email: null };
  }

  await db
    .update(appointments)
    .set({ status: "confirmed", updatedAt: new Date().toISOString() })
    .where(eq(appointments.id, appointmentId));

  const brand = branding ?? (await loadEmailBranding());
  const email = await sendAppointmentConfirmedEmail(row.customer.email || "", {
    customerName: row.customer.name,
    serviceName: row.service.name,
    barberName: row.barber?.name || "Atandı",
    date: row.appointment.date,
    time: row.appointment.time,
    duration: row.appointment.duration,
    price: row.appointment.price,
    businessName: brand.businessName,
    logoUrl: brand.logoUrl,
    address: brand.address,
    phone: brand.phone,
    siteUrl: brand.siteUrl,
  });

  return { email };
}

export async function confirmAllPendingAppointments(): Promise<{
  confirmed: number;
  emailsSent: number;
  emailsSkipped: number;
  emailsFailed: number;
}> {
  const pendingRows = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(eq(appointments.status, "pending"));

  const branding = await loadEmailBranding();
  let confirmed = 0;
  let emailsSent = 0;
  let emailsSkipped = 0;
  let emailsFailed = 0;

  for (const row of pendingRows) {
    const result = await confirmAppointmentWithEmail(row.id, branding);
    confirmed += 1;
    if (!result.email) continue;
    if (result.email.sent) emailsSent += 1;
    else if (result.email.skipped) emailsSkipped += 1;
    else if (result.email.error) emailsFailed += 1;
  }

  return { confirmed, emailsSent, emailsSkipped, emailsFailed };
}

function buildCancelledEmailPayload(
  row: AppointmentRow,
  brand: Awaited<ReturnType<typeof loadEmailBranding>>
) {
  return {
    customerName: row.customer.name,
    serviceName: row.service.name,
    barberName: row.barber?.name || "Atandı",
    date: row.appointment.date,
    time: row.appointment.time,
    businessName: brand.businessName,
    logoUrl: brand.logoUrl,
    address: brand.address,
    phone: brand.phone,
    siteUrl: brand.siteUrl,
  };
}

export async function cancelAppointmentWithEmail(
  appointmentId: number
): Promise<{ email: EmailResult | null }> {
  const row = await fetchAppointmentRow(appointmentId);
  if (!row) throw new Error("Randevu bulunamadı");

  const brand = await loadEmailBranding();
  const email = await sendAppointmentCancelledEmail(row.customer.email || "", buildCancelledEmailPayload(row, brand));

  const customerId = row.customer.id;

  await db.delete(appointments).where(eq(appointments.id, appointmentId));
  await cleanupOrphanCustomer(customerId);

  return { email };
}
