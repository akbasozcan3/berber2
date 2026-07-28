import { initDatabase, getDb, isDbAvailable } from "../lib/db/index.ts";
import { services } from "../lib/db/schema.ts";

try {
  await initDatabase();
  console.log("db available:", isDbAvailable());
  if (!isDbAvailable()) {
    console.log("DB not available");
    process.exit(1);
  }
  const db = getDb();
  const rows = await db.select().from(services).limit(4);
  console.log("services count:", rows.length);
  if (rows.length > 0) console.log("first:", rows[0].name);
} catch (e) {
  console.log("ERROR:", e.message);
  process.exit(1);
}
process.exit(0);
