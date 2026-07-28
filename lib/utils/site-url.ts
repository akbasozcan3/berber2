function normalizeSiteUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

export function resolvePublicSiteUrl(siteUrl?: string | null): string {
  const fromSettings = normalizeSiteUrl(siteUrl || "");
  if (fromSettings) return fromSettings;

  const fromEnv = normalizeSiteUrl(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "");
  if (fromEnv) return fromEnv;

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    return normalizeSiteUrl(productionHost);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeSiteUrl(vercelUrl);
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return "";
}
