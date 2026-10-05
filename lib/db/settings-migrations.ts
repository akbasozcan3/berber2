import { db } from "@/lib/db";
import { settings, barbers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isLegacyDefaultLunchBreak, serializeBreakTimes } from "@/lib/utils/break-times";
import { normalizeBarberWorkingDays } from "@/lib/utils/salon-schedule";
import { parseWorkingHoursJson, serializeWorkingHours } from "@/lib/data/working-hours";

const globalForMigrations = globalThis as typeof globalThis & {
  __migrationsDone?: boolean;
};

/** One-time fixes for settings that block booking unintentionally and migrate salon branding. */
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

  // 1. Business name migration
  const bNameRow = await db.select().from(settings).where(eq(settings.key, "business_name")).limit(1);
  if (!bNameRow[0] || bNameRow[0].value === "New Life Erkek Kuaförü" || !bNameRow[0].value) {
    if (bNameRow[0]) {
      await db.update(settings).set({ value: "M Studio Hairdresser" }).where(eq(settings.key, "business_name"));
    } else {
      await db.insert(settings).values({ key: "business_name", value: "M Studio Hairdresser" });
    }
  }

  // 2. Instagram migration
  const igRow = await db.select().from(settings).where(eq(settings.key, "instagram")).limit(1);
  if (!igRow[0] || igRow[0].value.includes("newlife") || !igRow[0].value) {
    if (igRow[0]) {
      await db.update(settings).set({ value: "https://www.instagram.com/mstudiohairdresser/" }).where(eq(settings.key, "instagram"));
    } else {
      await db.insert(settings).values({ key: "instagram", value: "https://www.instagram.com/mstudiohairdresser/" });
    }
  }

  // 3. TikTok migration
  const ttRow = await db.select().from(settings).where(eq(settings.key, "tiktok")).limit(1);
  if (!ttRow[0] || !ttRow[0].value) {
    if (ttRow[0]) {
      await db.update(settings).set({ value: "https://www.tiktok.com/@mehmetiis" }).where(eq(settings.key, "tiktok"));
    } else {
      await db.insert(settings).values({ key: "tiktok", value: "https://www.tiktok.com/@mehmetiis" });
    }
  }

  const allBarbers = await db.select().from(barbers);
  for (const barber of allBarbers) {
    const normalized = normalizeBarberWorkingDays(barber.workingDays);
    const updates: Partial<typeof barbers.$inferInsert> = {};
    if (normalized !== barber.workingDays) {
      updates.workingDays = normalized;
    }
    if (barber.name === "Mehmet Abi") {
      updates.name = "Mehmet İis";
      updates.position = "Kurucu & Master Hairdresser";
      updates.specialty = "Klasik & Modern Saç Tasarımı, Sakal Heykeltıraşlığı, VIP Bakım";
    }
    if (Object.keys(updates).length > 0) {
      await db.update(barbers).set(updates).where(eq(barbers.id, barber.id));
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

  const videoKeys: Record<string, string> = {
    nav_videos_label: "Videolar & Reels",
    videos_page_title: "Videolar & Reels",
    videos_page_subtitle:
      "Mehmet İis ve M Studio Hairdresser'ın ustalıkla hazırlanan saç tasarım, sakal şekillendirme ve VIP bakım videoları.",
    videos_page_banner:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop",
    videos_section_eyebrow: "Reels & TikTok",
    videos_section_title: "M Studio\nReels & Videolar",
    videos_section_subtitle:
      "Mehmet İis'in imza saç kesimleri, sakal heykeltıraşlığı ve VIP stüdyo dönüşümleri.",
  };

  for (const [k, v] of Object.entries(videoKeys)) {
    const existing = await db.select().from(settings).where(eq(settings.key, k)).limit(1);
    if (!existing[0]) {
      await db.insert(settings).values({ key: k, value: v });
    }
  }
}
