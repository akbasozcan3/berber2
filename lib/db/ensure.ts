import { seedDatabase } from "@/lib/db/seed";
import { initDatabase, isDbAvailable } from "@/lib/db";
import { runSettingsMigrations } from "@/lib/db/settings-migrations";

const g = globalThis as typeof globalThis & {
  __seedDone?: boolean;
  __seeding?: Promise<void> | null;
};

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/** Ensures DB is connected, migrations run, and seed applied when needed. */
export async function ensureDb(): Promise<boolean> {
  // Build sırasında DB'ye bağlanma — çok sayıda worker Windows'ta çökmeye yol açıyor.
  if (isBuildPhase()) return false;

  try {
    await initDatabase();
  } catch {
    return false;
  }

  if (!isDbAvailable()) return false;

  try {
    await runSettingsMigrations();
  } catch {
    // non-fatal
  }

  if (process.env.NODE_ENV === "development") return true;
  if (process.env.VERCEL) return true;
  if (process.env.RUN_DB_SEED !== "true") return true;

  if (g.__seedDone) return true;

  if (!g.__seeding) {
    g.__seeding = seedDatabase()
      .then(() => {
        g.__seedDone = true;
      })
      .catch(() => {
        g.__seeding = null;
      });
  }
  await g.__seeding;
  return true;
}
