import { db } from "@/lib/db";
import { settings, barbers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isLegacyDefaultLunchBreak, serializeBreakTimes } from "@/lib/utils/break-times";
import { normalizeBarberWorkingDays } from "@/lib/utils/salon-schedule";
import { parseWorkingHoursJson, serializeWorkingHours } from "@/lib/data/working-hours";

const globalForMigrations = globalThis as typeof globalThis & {
  __migrationsDone?: boolean;
};

/** One-time fixes for settings that block booking unintentionally. */
export async function runSettingsMigrations() {
  if (globalForMigrations.__migrationsDone) return;
  globalForMigrations.__migrationsDone = true;

  const row = await db.select().from(settings).where(eq(settings.key, "break_times")).limit(1);
  const value = row[0]?.value;
  if (isLegacyDefaultLunchBreak(value)) {
    await db.update(settings).set({ value: serializeBreakTimes([]) }).where(eq(settings.key, "break_times"));
  }

  const telegramRow = await db.select().from(settings).where(eq(settings.key, "notifications_telegram")).limit(1);
  if (!telegramRow[0] || telegramRow[0].value === "false") {
    if (telegramRow[0]) {
      await db.update(settings).set({ value: "true" }).where(eq(settings.key, "notifications_telegram"));
    } else {
      await db.insert(settings).values({ key: "notifications_telegram", value: "true" });
    }
  }

  const hoursRow = await db.select().from(settings).where(eq(settings.key, "working_hours")).limit(1);
  if (hoursRow[0]?.value) {
    const normalized = serializeWorkingHours(parseWorkingHoursJson(hoursRow[0].value));
    if (normalized !== hoursRow[0].value) {
      await db.update(settings).set({ value: normalized }).where(eq(settings.key, "working_hours"));
    }
  }

  const allBarbers = await db.select().from(barbers);
  for (const barber of allBarbers) {
    const normalized = normalizeBarberWorkingDays(barber.workingDays);
    if (normalized !== barber.workingDays) {
      await db.update(barbers).set({ workingDays: normalized }).where(eq(barbers.id, barber.id));
    }
  }

  const emailRow = await db.select().from(settings).where(eq(settings.key, "notifications_email")).limit(1);
  if (!emailRow[0] || emailRow[0].value === "false") {
    if (emailRow[0]) {
      await db.update(settings).set({ value: "true" }).where(eq(settings.key, "notifications_email"));
    } else {
      await db.insert(settings).values({ key: "notifications_email", value: "true" });
    }
  }

  // Not: iptal randevu silme ve müşteri senkronizasyonu burada kasıtlı çalıştırılmıyor.
  // Her boot'ta tüm müşterileri tek tek sync etmek çok yavaş ve connection timeout'a yol açıyor.
  // Bu işlemler sadece admin panelinden/randevu onayından tetiklenmeli.
}
