export function businessInitials(name?: string | null, fallback = "SA"): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function splitBusinessNameForLogo(name?: string | null): { primary: string; secondary: string } {
  const safe = (name || "").trim();
  if (!safe) return { primary: "SALON", secondary: "" };
  const words = safe.split(/\s+/).filter(Boolean);

  // 1 kelime → hepsini primary
  if (words.length === 1) return { primary: words[0].toUpperCase(), secondary: "" };

  // "New Life Erkek Kuaförü" → primary: "New Life", secondary: "Erkek Kuaförü"
  // İlk 2 kelimeyi primary, gerisini secondary yap
  const midpoint = Math.min(2, Math.ceil(words.length / 2));
  return {
    primary: words.slice(0, midpoint).join(" "),
    secondary: words.slice(midpoint).join(" "),
  };
}

export function brandWordmark(name?: string | null): string {
  const first = (name || "").trim().split(/\s+/)[0];
  return (first || "SALON").toUpperCase().slice(0, 12);
}

export function withBusinessName(template: string, businessName: string): string {
  return template.replace(/\{business\}/g, businessName || "Salon");
}

export const siteLogoImageClass =
  "h-14 sm:h-16 md:h-20 lg:h-24 w-auto max-w-[220px] sm:max-w-[260px] md:max-w-[300px] object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition-all duration-300";
export const navbarLogoImageClass =
  "h-14 sm:h-16 md:h-18 lg:h-20 w-auto object-contain transition-all duration-300";
export const mobileLogoImageClass =
  "h-16 w-auto max-w-[220px] object-contain object-left";
