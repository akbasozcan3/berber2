import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { loadLocalEnv, resolveDatabaseUrlFromEnv } from "@/lib/utils/load-local-env";
import { preparePgConnection } from "@/lib/db/connection";

const globalForDb = globalThis as typeof globalThis & {
  __pgPool?: Pool;
  __drizzleDb?: NodePgDatabase<typeof schema>;
  __dbAvailable?: boolean;
  __lastDbError?: string | null;
};

let initialized = false;
let initPromise: Promise<void> | null = null;

function normalizeConnectionString(raw: string): string {
  // Windows'ta localhost bazen IPv6 (::1) olarak çözülür; pg bağlantısı takılabiliyor.
  return raw.replace(/@localhost([:/])/g, "@127.0.0.1$1");
}

function resolveConnectionString(): string | null {
  loadLocalEnv();

  const connectionString = resolveDatabaseUrlFromEnv();

  return connectionString ? normalizeConnectionString(connectionString) : null;
}

export function isDbAvailable(): boolean {
  return globalForDb.__dbAvailable === true;
}

export function getLastDbError(): string | null {
  return globalForDb.__lastDbError ?? null;
}

function resetPool() {
  globalForDb.__pgPool = undefined;
  globalForDb.__drizzleDb = undefined;
}

function getPool() {
  if (!globalForDb.__pgPool) {
    const connStr = resolveConnectionString();
    if (!connStr) throw new Error("DB_NOT_CONFIGURED");

    const isServerless = Boolean(process.env.VERCEL);
    const { connectionString, ssl } = preparePgConnection(connStr, isServerless);

    globalForDb.__pgPool = new Pool({
      connectionString,
      max: isServerless ? 1 : 3,
      idleTimeoutMillis: isServerless ? 5000 : 30000,
      connectionTimeoutMillis: isServerless ? 20000 : 5000,
      allowExitOnIdle: isServerless,
      ssl,
    });
  }
  return globalForDb.__pgPool;
}

export function getDb() {
  if (!globalForDb.__drizzleDb) {
    globalForDb.__drizzleDb = drizzle(getPool(), { schema });
  }
  return globalForDb.__drizzleDb;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export async function initDatabase() {
  if (initialized) return;
  if (initPromise) return initPromise;

  if (!resolveConnectionString()) {
    globalForDb.__dbAvailable = false;
    return;
  }

  initPromise = (async () => {
    try {
      await getPool().query("select 1");
      globalForDb.__dbAvailable = true;
      globalForDb.__lastDbError = null;
      initialized = true;
    } catch (err) {
      globalForDb.__dbAvailable = false;
      globalForDb.__lastDbError = err instanceof Error ? err.message : "DB_CONNECTION_FAILED";
      resetPool();
      initPromise = null;
      initialized = false;
      throw new Error("DB_CONNECTION_FAILED");
    }
  })();

  return initPromise;
}
