import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

function loadLocalEnv() {
  const candidates = [
    path.join(/* turbopackIgnore: true */ process.cwd(), ".env.local"),
    path.join(/* turbopackIgnore: true */ process.cwd(), "..", "..", ".env.local"),
  ];
  for (const envPath of candidates) {
    if (!fs.existsSync(/* turbopackIgnore: true */ envPath)) continue;
    const content = fs.readFileSync(/* turbopackIgnore: true */ envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2].trim();
      value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      if (!process.env[key]) process.env[key] = value;
    }
    break;
  }
}

const globalForDb = globalThis as typeof globalThis & {
  __pgPool?: Pool;
  __drizzleDb?: NodePgDatabase<typeof schema>;
  __dbAvailable?: boolean;
};

let initialized = false;
let initPromise: Promise<void> | null = null;

function normalizeConnectionString(raw: string): string {
  // Windows'ta localhost bazen IPv6 (::1) olarak çözülür; pg bağlantısı takılabiliyor.
  return raw.replace(/@localhost([:/])/g, "@127.0.0.1$1");
}

function resolveConnectionString(): string | null {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) loadLocalEnv();

  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_CONNECTION_STRING;

  return connectionString ? normalizeConnectionString(connectionString) : null;
}

export function isDbAvailable(): boolean {
  return globalForDb.__dbAvailable === true;
}

function getPool() {
  if (!globalForDb.__pgPool) {
    const connStr = resolveConnectionString();
    if (!connStr) throw new Error("DB_NOT_CONFIGURED");

    const isServerless = Boolean(process.env.VERCEL);
    globalForDb.__pgPool = new Pool({
      connectionString: connStr,
      max: isServerless ? 1 : 3,
      idleTimeoutMillis: isServerless ? 5000 : 30000,
      connectionTimeoutMillis: 5000,
      allowExitOnIdle: isServerless,
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
      initialized = true;
    } catch {
      globalForDb.__dbAvailable = false;
      initPromise = null;
      throw new Error("DB_CONNECTION_FAILED");
    }
  })();

  return initPromise;
}
