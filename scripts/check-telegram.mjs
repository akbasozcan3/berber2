import fs from "fs";
import pg from "pg";

for (const rawLine of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const m = line.match(/^DATABASE_URL=(.*)$/);
  if (!m) continue;
  process.env.DATABASE_URL = m[1].trim().replace(/^["']|["']$/g, "");
}

const url = process.env.DATABASE_URL.replace("@localhost", "@127.0.0.1");
const pool = new pg.Pool({ connectionString: url });

const { rows } = await pool.query(
  "select key, value from settings where key like 'telegram%' order by key"
);
console.log(rows);
await pool.end();
