import { loadLocalEnv, resolveDatabaseUrlFromEnv } from "../lib/utils/load-local-env.ts";

loadLocalEnv();

const url = resolveDatabaseUrlFromEnv();
if (!url) {
  console.error("DATABASE_URL bulunamadi. .env.local dosyasini kontrol edin.");
  process.exit(1);
}

const masked = url.replace(/:([^:@/]+)@/, ":***@");
let host = "bilinmiyor";
try {
  host = new URL(url.replace(/^postgres(ql)?:\/\//, "http://")).hostname;
} catch {
  host = masked.slice(0, 60);
}

const isLocal = /localhost|127\.0\.0\.1/i.test(url);
console.log("");
console.log("Veritabani baglantisi:");
console.log("  Host:", host);
console.log("  Tip:", isLocal ? "YEREL (PC) — Vercel canli siteye gitmez!" : "UZAK (Vercel/Neon) — canli site icin dogru");
console.log("");

if (isLocal) {
  console.log("UYARI: Canli siteye seed atmak icin Vercel Postgres URL'sini .env.local icindeki DATABASE_URL'e yapistirin.");
  console.log("Vercel → Proje → Storage → Postgres → .env.local sekmesi");
  process.exit(2);
}

console.log("Baglanti test ediliyor...");
const { Pool } = await import("pg");
const pool = new Pool({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1/i.test(url) ? undefined : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

try {
  await pool.query("select 1");
  const tables = ["settings", "services", "barbers", "appointments"];
  for (const table of tables) {
    const r = await pool.query(`select count(*)::int as c from ${table}`);
    console.log(`  ${table}: ${r.rows[0]?.c ?? 0} kayit`);
  }
  console.log("");
  console.log("OK — npm run db:setup calistirabilirsiniz.");
} catch (err) {
  console.error("Baglanti hatasi:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await pool.end();
}
