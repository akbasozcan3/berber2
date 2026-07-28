import { db } from "@/lib/db";
import { settings, appointments, barbers, services, customers } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import {
  isMultilineSettingKey,
  normalizeMultilineSettingValue,
} from "@/lib/data/multiline-settings";
import { parseBreakTimes } from "@/lib/utils/break-times";
import { parseLocalIsoDate, isLocalIsoToday, getSalonNowMinutes } from "@/lib/utils/format";
import { findOrUpsertCustomer } from "@/lib/services/customers";
import { isSunday, barberWorksOnDate } from "@/lib/utils/salon-schedule";
import {
  getActiveRulesForDate,
  getDayStatus,
  getEffectiveHours,
  isSlotBlockedByRules,
  parseTime,
  isInBreak,
  canBarberTakeSlot,
} from "./availability";

export async function getSetting(key: string): Promise<string | null> {
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (existing.length === 0) {
    await db.insert(settings).values({ key, value });
  } else {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const result: Record<string, string> = {};

  for (const row of rows) {
    let value = row.value;
    if (isMultilineSettingKey(row.key)) {
      const fixed = normalizeMultilineSettingValue(value);
      if (fixed !== value) {
        await setSetting(row.key, fixed);
        value = fixed;
      }
    }
    result[row.key] = value;
  }

  return result;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateSlots(start: string, end: string, interval: number, serviceDuration: number): string[] {
  const slots: string[] = [];
  let current = parseTime(start);
  const endMin = parseTime(end);
  const minSpan = Math.max(interval, serviceDuration);
  while (current + minSpan <= endMin) {
    slots.push(formatTime(current));
    current += interval;
  }
  return slots;
}

export async function getAvailableSlots(
  date: string,
  serviceId: number,
  barberId?: number | null
): Promise<{ time: string; available: boolean; reason?: string }[]> {
  const interval = Number((await getSetting("appointment_interval")) || 30);
  const breakTimes = parseBreakTimes(await getSetting("break_times"));
  const maxFuture = Number((await getSetting("max_future_booking")) || 30);
  const maxBookingsPerSlot = Number((await getSetting("max_bookings_per_slot")) || 1);

  const selectedDate = parseLocalIsoDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) return [];

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxFuture);
  if (selectedDate > maxDate) return [];

  if (isSunday(date)) return [];

  const dayStatus = await getDayStatus(date);
  if (dayStatus === "closed" || dayStatus === "past" || dayStatus === "holiday") return [];

  const service = (await db.select().from(services).where(eq(services.id, serviceId)).limit(1))[0];
  if (!service) return [];

  const rules = await getActiveRulesForDate(date);

  let targetBarbers = await db.select().from(barbers).where(
    and(eq(barbers.available, true), eq(barbers.onVacation, false))
  );

  if (barberId) {
    targetBarbers = targetBarbers.filter((b) => b.id === barberId);
  }

  targetBarbers = targetBarbers.filter((b) => barberWorksOnDate(date, b.workingDays));

  if (targetBarbers.length === 0) return [];

  const hoursList = targetBarbers.map((b) =>
    getEffectiveHours(date, b, rules.filter((r) => !r.barberId || r.barberId === b.id))
  );
  const earliestStart = hoursList.reduce((min, h) => Math.min(min, parseTime(h.open)), Infinity);
  const latestEnd = hoursList.reduce((max, h) => Math.max(max, parseTime(h.close)), 0);

  const allSlots = generateSlots(formatTime(earliestStart), formatTime(latestEnd), interval, service.duration);

  const existingAppointments = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.date, date),
        inArray(appointments.status, ["pending", "confirmed"])
      )
    );

  const leadMinutes = Math.max(interval, 30);
  const nowMinutes = getSalonNowMinutes();

  return allSlots.map((time) => {
    if (isInBreak(time, service.duration, breakTimes)) {
      return { time, available: false, reason: "Mola saati" };
    }

    const slotStart = parseTime(time);
    const slotEnd = slotStart + service.duration;

    const blocked = isSlotBlockedByRules(slotStart, slotEnd, rules, barberId);
    if (blocked.blocked) {
      return { time, available: false, reason: blocked.reason || "Müsait değil" };
    }

    if (isLocalIsoToday(date) && slotStart < nowMinutes + leadMinutes) {
      return { time, available: false, reason: "Geçmiş saat" };
    }

    const anyBarberFree = targetBarbers.some((barber) =>
      canBarberTakeSlot({
        barber,
        date,
        slotTime: time,
        slotStart,
        slotEnd,
        rules,
        existingAppointments,
        breakTimes,
        maxBookingsPerSlot,
      })
    );

    return {
      time,
      available: anyBarberFree,
      reason: anyBarberFree ? undefined : "Dolu",
    };
  });
}

export async function createBooking(data: {
  customerName: string;
  phone: string;
  email: string;
  serviceId: number;
  barberId?: number | null;
  date: string;
  time: string;
  notes?: string;
  agreed: boolean;
}) {
  if (!data.agreed) throw new Error("Sözleşme onayı gereklidir.");

  const email = data.email?.trim().toLowerCase() || "";
  if (!email) throw new Error("E-posta adresi gereklidir.");

  const service = (await db.select().from(services).where(eq(services.id, data.serviceId)).limit(1))[0];
  if (!service || !service.enabled) throw new Error("Hizmet bulunamadı.");

  const slots = await getAvailableSlots(data.date, data.serviceId, data.barberId);
  const slot = slots.find((s) => s.time === data.time);
  if (!slot?.available) throw new Error("Seçilen saat müsait değil.");

  let barberId = data.barberId;
  if (!barberId) {
    const availableBarbers = await db.select().from(barbers).where(
      and(eq(barbers.available, true), eq(barbers.onVacation, false))
    );
    const existingApts = await db.select().from(appointments).where(
      and(
        eq(appointments.date, data.date),
        inArray(appointments.status, ["pending", "confirmed"])
      )
    );
    const rules = await getActiveRulesForDate(data.date);
    const breakTimes = parseBreakTimes(await getSetting("break_times"));
    const maxBookingsPerSlot = Number((await getSetting("max_bookings_per_slot")) || 1);
    const slotStart = parseTime(data.time);
    const slotEnd = slotStart + service.duration;

    const freeBarber = availableBarbers.find((barber) =>
      canBarberTakeSlot({
        barber,
        date: data.date,
        slotTime: data.time,
        slotStart,
        slotEnd,
        rules,
        existingAppointments: existingApts,
        breakTimes,
        maxBookingsPerSlot,
      })
    );
    if (!freeBarber) throw new Error("Müsait berber bulunamadı.");
    barberId = freeBarber.id;
  }

  const customerId = await findOrUpsertCustomer({
    customerName: data.customerName,
    phone: data.phone,
    email,
  });

  const timestamp = new Date().toISOString();

  const conflict = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.barberId, barberId!),
        eq(appointments.date, data.date),
        eq(appointments.time, data.time),
        inArray(appointments.status, ["pending", "confirmed"])
      )
    )
    .limit(1);

  if (conflict[0]) throw new Error("Bu saat az önce dolmuş. Lütfen başka saat seçin.");

  const [appointment] = await db
    .insert(appointments)
    .values({
      customerId,
      serviceId: data.serviceId,
      barberId,
      date: data.date,
      time: data.time,
      duration: service.duration,
      price: service.price,
      status: "pending",
      notes: data.notes,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  const barber = (await db.select().from(barbers).where(eq(barbers.id, barberId!)).limit(1))[0];
  const customer = (await db.select().from(customers).where(eq(customers.id, customerId)).limit(1))[0];

  return { appointment, service, barber, customer };
}
