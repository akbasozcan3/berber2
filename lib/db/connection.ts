/** Vercel + Prisma Postgres: sslmode=require verify-full bazen basarisiz oluyor. */
export function preparePgConnection(connectionString: string, isServerless: boolean) {
  const isRemote = !/localhost|127\.0\.0\.1/i.test(connectionString);

  let normalized = connectionString.replace(/^postgres:\/\//, "postgresql://");

  if (!isServerless || !isRemote) {
    return { connectionString: normalized, ssl: undefined as undefined | { rejectUnauthorized: boolean } };
  }

  try {
    const parsed = new URL(normalized.replace(/^postgresql:\/\//, "http://"));
    parsed.searchParams.delete("sslmode");
    const query = parsed.searchParams.toString();
    const base = normalized.split("?")[0];
    normalized = query ? `${base}?${query}` : base;
  } catch {
    normalized = normalized.replace(/([?&])sslmode=[^&]*/gi, "").replace(/[?&]$/, "");
  }

  return {
    connectionString: normalized,
    ssl: { rejectUnauthorized: false },
  };
}
