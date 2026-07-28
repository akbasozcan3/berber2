import fs from "fs";
import path from "path";

export function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    // .env.local dosyasi yerel gelistirmede her zaman onceliklidir.
    process.env[key] = value;
  }
}

export function resolveDatabaseUrlFromEnv(): string {
  const candidates = process.env.VERCEL
    ? [
        process.env.DATABASE_URL,
        process.env.POSTGRES_PRISMA_URL,
        process.env.POSTGRES_URL,
        process.env.DATABASE_URL_POSTGRES_URL,
        process.env.DATABASE_URL_PRISMA_DATABASE_URL,
        process.env.DATABASE_URL_DATABASE_URL,
        process.env.POSTGRES_URL_NON_POOLING,
        process.env.POSTGRES_CONNECTION_STRING,
      ]
    : [
        process.env.DATABASE_URL,
        process.env.DATABASE_URL_DATABASE_URL,
        process.env.DATABASE_URL_POSTGRES_URL,
        process.env.DATABASE_URL_PRISMA_DATABASE_URL,
        process.env.POSTGRES_URL_NON_POOLING,
        process.env.POSTGRES_URL,
        process.env.POSTGRES_PRISMA_URL,
        process.env.POSTGRES_CONNECTION_STRING,
      ];

  return candidates.find((value) => Boolean(value?.trim()))?.trim() || "";
}
