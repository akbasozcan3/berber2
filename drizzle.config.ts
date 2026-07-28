import type { Config } from "drizzle-kit";
import { loadLocalEnv, resolveDatabaseUrlFromEnv } from "@/lib/utils/load-local-env";

loadLocalEnv();

const databaseUrl = resolveDatabaseUrlFromEnv();

const drizzleConfig: Config = {
  schema: ["./lib/db/schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl || "",
  },
  // When the connection string is missing, drizzle-kit commands will fail with a clear error.
};

export default drizzleConfig;

