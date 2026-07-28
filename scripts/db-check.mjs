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
  connectionTimeoutMillis: 15000,
});

const requiredTables = ["settings", "services", "barbers", "appointments", "customers"];

try {
  await pool.query("select 1");

  console.log("");
  console.log("Tablolar:");
  for (const table of requiredTables) {
    const exists = await pool.query(
      `select exists (
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = $1
      ) as ok`,
      [table]
    );
    const ok = Boolean(exists.rows[0]?.ok);
    if (!ok) {
      console.log(`  ${table}: EKSIK`);
      continue;
    }
    const r = await pool.query(`select count(*)::int as c from ${table}`);
    console.log(`  ${table}: ${r.rows[0]?.c ?? 0} kayit`);
  }

  const barberCols = await pool.query(
    `select column_name from information_schema.columns
     where table_schema = 'public' and table_name = 'barbers'
     order by column_name`
  );
  const columns = barberCols.rows.map((row) => row.column_name);
  if (columns.length === 0) {
    console.log("");
    console.log("HATA: barbers tablosu yok. Calistirin: npm run db:migrate");
    process.exit(1);
  }
  if (!columns.includes("sort_order")) {
    console.log("");
    console.log("HATA: barbers.sort_order kolonu yok. Calistirin: npm run db:migrate");
    process.exit(1);
  }

  console.log("");
  console.log("OK — npm run db:setup calistirabilirsiniz.");
} catch (err) {
  console.error("Baglanti hatasi:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await pool.end();
}
