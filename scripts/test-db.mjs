import fs from "fs";
import pg from "pg";

const envPath = ".env.local";
if (!fs.existsSync(envPath)) {
  console.log("NO_ENV");
  process.exit(1);
}

for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.log("NO_DB_URL");
  process.exit(1);
}

const host = url.match(/@([^/:?]+)/)?.[1] ?? "?";
console.log("host=" + host);

const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 5000 });
try {
  await pool.query("select 1");
  console.log("OK");
} catch (e) {
  console.log("FAIL: " + e.message);
  process.exit(1);
} finally {
  await pool.end();
}
