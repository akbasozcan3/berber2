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
    process.env[key] = cleanEnvValue(match[2]);
  }
}

function cleanEnvValue(value?: string): string {
  if (!value?.trim()) return "";
  return value.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

function isLocalDbUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

export function resolveDatabaseUrlFromEnv(): string {
  const rawCandidates = process.env.VERCEL
    ? [
        process.env.DATABASE_URL,
        process.env.POSTGRES_URL,
        process.env.POSTGRES_PRISMA_URL,
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

  const candidates = rawCandidates.map(cleanEnvValue).filter(Boolean);

  if (process.env.VERCEL) {
    const remote = candidates.find((url) => !isLocalDbUrl(url));
    return remote || candidates[0] || "";
  }

  return candidates[0] || "";
}
