import { db } from "@/lib/db";
import { availabilityBlocks, availabilityAuditLog, barbers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSetting } from "./booking";
import { parseLocalIsoDate, toLocalIsoDate } from "@/lib/utils/format";
import { isSunday, barberWorksOnDate } from "@/lib/utils/salon-schedule";

export type RuleType = "block" | "close_day" | "hours_override" | "early_close" | "late_open" | "permanent";
export type QuickScope = "today" | "tomorrow" | "this_week" | "next_week" | "this_month" | "next_month" | "this_year" | "permanent";

export interface CreateAvailabilityInput {
  ruleType: RuleType;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  customOpen?: string;
  customClose?: string;
  scope?: string;
  reason?: string;
  barberId?: number | null;
  createdBy?: string;
}

function formatDate(d: Date): string {
  return toLocalIsoDate(d);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfWeek(d: Date): Date {
  const s = startOfWeek(d);
  return addDays(s, 6);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31);
}

export function getDateRangeForScope(scope: QuickScope, ref = new Date()): { start: string; end: string } {
  const today = new Date(ref);
  today.setHours(0, 0, 0, 0);

  switch (scope) {
    case "today":
      return { start: formatDate(today), end: formatDate(today) };
    case "tomorrow": {
      const t = addDays(today, 1);
      return { start: formatDate(t), end: formatDate(t) };
    }
    case "this_week":
      return { start: formatDate(startOfWeek(today)), end: formatDate(endOfWeek(today)) };
    case "next_week": {
      const next = addDays(startOfWeek(today), 7);
      return { start: formatDate(next), end: formatDate(addDays(next, 6)) };
    }
    case "this_month":
      return { start: formatDate(startOfMonth(today)), end: formatDate(endOfMonth(today)) };
    case "next_month": {
      const n = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return { start: formatDate(n), end: formatDate(endOfMonth(n)) };
    }
    case "this_year":
      return { start: formatDate(startOfYear(today)), end: formatDate(endOfYear(today)) };
    case "permanent":
      return { start: formatDate(today), end: "2099-12-31" };
    default:
      return { start: formatDate(today), end: formatDate(today) };
  }
}

function eachDateInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = parseLocalIsoDate(start);
  const last = parseLocalIsoDate(end);
  while (cur <= last) {
    dates.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export async function logAvailabilityChange(data: {
  adminName: string;
  action: string;
  previousState?: unknown;
  newState?: unknown;
  reason?: string;
}) {
  await db.insert(availabilityAuditLog).values({
    adminName: data.adminName,
    action: data.action,
    previousState: data.previousState ? JSON.stringify(data.previousState) : null,
    newState: data.newState ? JSON.stringify(data.newState) : null,
    reason: data.reason ?? null,
    createdAt: new Date().toISOString(),
  });
}

export async function createAvailabilityRule(input: CreateAvailabilityInput) {
  const timestamp = new Date().toISOString();
  const endDate = input.endDate || input.date;
  const dates = eachDateInRange(input.date, endDate);
  const created: (typeof availabilityBlocks.$inferSelect)[] = [];

  for (const date of dates) {
    let startTime = input.startTime || "00:00";
    let endTime = input.endTime || "23:59";

    if (input.ruleType === "close_day" || input.ruleType === "permanent") {
      startTime = "00:00";
      endTime = "23:59";
    } else if (input.ruleType === "early_close") {
      startTime = "00:00";
      endTime = input.endTime || "16:00";
    } else if (input.ruleType === "late_open") {
      startTime = input.startTime || "13:00";
      endTime = "23:59";
    } else if (input.ruleType === "hours_override") {
      startTime = "00:00";
      endTime = "23:59";
    }

    const [block] = await db
      .insert(availabilityBlocks)
      .values({
        date,
        endDate: input.endDate || date,
        startTime,
        endTime,
        ruleType: input.ruleType,
        customOpen: input.customOpen || null,
        customClose: input.customClose || null,
        scope: input.scope || null,
        reason: input.reason || "Müsait değil",
        barberId: input.barberId ?? null,
        active: true,
        createdBy: input.createdBy || null,
        createdAt: timestamp,
      })
      .returning();
    created.push(block);
  }

  return created;
}

export async function deactivateAllRules() {
  const all = await db.select().from(availabilityBlocks).where(eq(availabilityBlocks.active, true));
  for (const block of all) {
    await db.update(availabilityBlocks).set({ active: false }).where(eq(availabilityBlocks.id, block.id));
  }
  return all.length;
}

export async function getActiveRulesForDate(date: string) {
  const all = await db.select().from(availabilityBlocks).where(eq(availabilityBlocks.active, true));
  return all.filter((rule) => {
    const end = rule.endDate || rule.date;
    return date >= rule.date && date <= end;
  });
}

export async function getDayStatus(date: string): Promise<"available" | "closed" | "limited" | "holiday" | "past"> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = parseLocalIsoDate(date);
  if (Number.isNaN(d.getTime()) || d < today) return "past";

  if (isSunday(date)) return "closed";

  const holidays = JSON.parse((await getSetting("holidays")) || "[]") as string[];
  if (holidays.includes(date)) return "holiday";

  const rules = await getActiveRulesForDate(date);
  const globalClose = rules.some(
    (r) => !r.barberId && (r.ruleType === "close_day" || r.ruleType === "permanent") && r.startTime === "00:00"
  );
  if (globalClose) return "closed";

  const hasOverride = rules.some((r) => r.ruleType === "hours_override" || r.ruleType === "early_close" || r.ruleType === "late_open");
  if (hasOverride) return "limited";

  return "available";
}

export async function getAuditLog(limit = 100) {
  const { desc } = await import("drizzle-orm");
  return db.select().from(availabilityAuditLog).orderBy(desc(availabilityAuditLog.createdAt)).limit(limit);
}

export async function getBarbers() {
  return db.select().from(barbers);
}

export function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isInBreak(
  time: string,
  duration: number,
  breaks: { start: string; end: string }[]
): boolean {
  const start = parseTime(time);
  const end = start + duration;
  return breaks.some((b) => {
    const bStart = parseTime(b.start);
    const bEnd = parseTime(b.end);
    return start < bEnd && end > bStart;
  });
}

export function getEffectiveHours(
  date: string,
  barber: { id?: number; workingStart: string; workingEnd: string },
  rules: (typeof availabilityBlocks.$inferSelect)[]
): { open: string; close: string } {
  let open = barber.workingStart;
  let close = barber.workingEnd;

  const applicable = rules.filter(
    (r) => !r.barberId || (barber.id !== undefined && r.barberId === barber.id)
  );
  const ordered = [
    ...applicable.filter((r) => !r.barberId),
    ...applicable.filter((r) => r.barberId),
  ];

  for (const rule of ordered) {
    if (rule.ruleType === "hours_override" && rule.customOpen && rule.customClose) {
      open = rule.customOpen;
      close = rule.customClose;
    }
    if (rule.ruleType === "early_close" && rule.endTime) {
      close = rule.endTime;
    }
    if (rule.ruleType === "late_open" && rule.startTime) {
      open = rule.startTime;
    }
  }

  return { open, close };
}

export function canBarberTakeSlot(params: {
  barber: { id: number; workingDays: string; workingStart: string; workingEnd: string };
  date: string;
  slotTime: string;
  slotStart: number;
  slotEnd: number;
  rules: (typeof availabilityBlocks.$inferSelect)[];
  existingAppointments: { barberId: number | null; time: string; duration: number }[];
  breakTimes: { start: string; end: string }[];
  maxBookingsPerSlot?: number;
}): boolean {
  const {
    barber,
    date,
    slotTime,
    slotStart,
    slotEnd,
    rules,
    existingAppointments,
    breakTimes,
    maxBookingsPerSlot = 1,
  } = params;

  if (!barberWorksOnDate(date, barber.workingDays)) return false;

  const barberRules = rules.filter((r) => !r.barberId || r.barberId === barber.id);
  const hours = getEffectiveHours(date, barber, barberRules);
  const open = parseTime(hours.open);
  const close = parseTime(hours.close);
  if (slotStart < open || slotEnd > close) return false;

  if (isInBreak(slotTime, slotEnd - slotStart, breakTimes)) return false;

  const block = isSlotBlockedByRules(slotStart, slotEnd, barberRules, barber.id);
  if (block.blocked) return false;

  const barberApts = existingAppointments.filter((a) => a.barberId === barber.id);
  const sameTimeCount = barberApts.filter((apt) => apt.time === slotTime).length;
  if (sameTimeCount >= maxBookingsPerSlot) return false;

  return !barberApts.some((apt) => {
    const aptStart = parseTime(apt.time);
    const aptEnd = aptStart + apt.duration;
    return slotStart < aptEnd && slotEnd > aptStart;
  });
}

export function isSlotBlockedByRules(
  slotStart: number,
  slotEnd: number,
  rules: (typeof availabilityBlocks.$inferSelect)[],
  barberId?: number | null
): { blocked: boolean; reason?: string } {
  for (const rule of rules) {
    if (barberId && rule.barberId && rule.barberId !== barberId) continue;
    if (!barberId && rule.barberId) continue;

    if (rule.ruleType === "close_day" || rule.ruleType === "permanent") {
      return { blocked: true, reason: rule.reason };
    }

    const bStart = parseTime(rule.startTime);
    const bEnd = parseTime(rule.endTime);
    if (slotStart < bEnd && slotEnd > bStart) {
      return { blocked: true, reason: rule.reason };
    }
  }
  return { blocked: false };
}
