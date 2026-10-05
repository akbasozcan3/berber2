export interface WorkingHour {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export function digitsOnly(phone?: string | null): string {
  return (phone ?? "").replace(/\D/g, "");
}

/** Salon operates in Turkey — Vercel UTC ile uyum için sabit saat dilimi. */
export const SALON_TIMEZONE = "Europe/Istanbul";

type SalonClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getSalonClock(date = new Date()): SalonClock {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: SALON_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour") % 24,
    minute: pick("minute"),
  };
}

export function getSalonWeekday(date = new Date()): number {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: SALON_TIMEZONE,
    weekday: "short",
  });
  const label = formatter.format(date).slice(0, 3);
  return WEEKDAY_TO_INDEX[label] ?? 0;
}

/** YYYY-MM-DD in salon timezone (Istanbul). */
export function toLocalIsoDate(date = new Date()): string {
  const { year, month, day } = getSalonClock(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getSalonNowMinutes(date = new Date()): number {
  const { hour, minute } = getSalonClock(date);
  return hour * 60 + minute;
}

export function addDaysToIso(iso: string, days: number): string {
  const base = parseLocalIsoDate(iso);
  base.setDate(base.getDate() + days);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
}

/** Parse YYYY-MM-DD as local calendar date (never UTC midnight). */
export function parseLocalIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return new Date(NaN);
  return new Date(y, m - 1, d);
}

export function isLocalIsoToday(iso: string): boolean {
  return iso === toLocalIsoDate();
}

/** 0 = Sunday, same as Date#getDay(). */
export function getLocalDayOfWeek(iso: string): number {
  return parseLocalIsoDate(iso).getDay();
}

export function compareLocalIsoDates(a: string, b: string): number {
  return a.localeCompare(b);
}

export function formatIsoDateTr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatPhoneDisplay(phone?: string | null): string {
  const safe = phone ?? "";
  const digits = digitsOnly(phone);
  if (digits.length === 12 && digits.startsWith("90")) {
    return `0${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  return safe;
}

export function toTelHref(phone?: string | null): string {
  const digits = digitsOnly(phone);
  if (!digits) return "tel:";
  return `tel:+${digits.startsWith("90") ? digits : `90${digits.replace(/^0/, "")}`}`;
}

/** WhatsApp deep link for salon / business contact. */
export function toWhatsAppHref(phone?: string | null, message?: string): string {
  const digits = digitsOnly(phone);
  if (!digits) return "https://wa.me/";
  let normalized = digits;
  if (normalized.startsWith("0")) normalized = `90${normalized.slice(1)}`;
  else if (normalized.length === 10) normalized = `90${normalized}`;
  const base = `https://wa.me/${normalized}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

/** Store phones as +90XXXXXXXXXX for consistent display across the site. */
export function normalizePhoneStorage(phone?: string | null): string {
  const digits = digitsOnly(phone);
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("90")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+90${digits.slice(1)}`;
  if (digits.length === 10) return `+90${digits}`;
  return phone?.trim() ?? "";
}

export function googleMapsEmbedUrl(mapsUrl?: string | null, address?: string | null): string {
  const query = mapsUrl?.trim() || address?.trim() || "Berber Salonu";
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function formatWorkingHoursSummary(hours: WorkingHour[]): string {
  const openDays = hours.filter((h) => !h.closed && h.open && h.close);
  if (openDays.length === 0) return "Kapalı";

  const displayClose = (close: string) => (close === "00:00" ? "24:00" : close);

  const sameHours = openDays.every(
    (h) =>
      h.open === openDays[0].open &&
      displayClose(h.close) === displayClose(openDays[0].close)
  );
  const closedSunday =
    hours.some((h) => h.day === "Pazar" && h.closed) && openDays.length === 6;

  if (sameHours && closedSunday) {
    return `Pzt–Cmt: ${openDays[0].open} – ${displayClose(openDays[0].close)}`;
  }

  return openDays.map((h) => `${h.day}: ${h.open}–${displayClose(h.close)}`).join(" · ");
}

/** Kısa özet — navbar üst şeridi gibi dar alanlar için */
export function formatWorkingHoursTopbar(hours: WorkingHour[]): string {
  const openDays = hours.filter((h) => !h.closed && h.open && h.close);
  if (openDays.length === 0) return "Kapalı";

  const displayClose = (close: string) => (close === "00:00" ? "24:00" : close);
  const slot = (h: WorkingHour) => `${h.open}–${displayClose(h.close)}`;

  const weekdays = openDays.filter((h) => h.day !== "Cumartesi" && h.day !== "Pazar");
  const saturday = openDays.find((h) => h.day === "Cumartesi");
  const weekdaySlot = weekdays[0] ? slot(weekdays[0]) : "";
  const weekdaysMatch =
    weekdays.length > 0 &&
    weekdays.every((h) => slot(h) === weekdaySlot);

  if (weekdaysMatch && saturday) {
    if (slot(saturday) === weekdaySlot) {
      return `Pzt–Cmt: ${weekdaySlot}`;
    }
    return `Pzt–Cum: ${weekdaySlot} · Cmt: ${slot(saturday)}`;
  }

  if (weekdaysMatch) {
    return `Pzt–Cum: ${weekdaySlot}`;
  }

  const summary = formatWorkingHoursSummary(hours);
  return summary.length > 42 ? `${openDays[0].day.slice(0, 3)}–${openDays[openDays.length - 1].day.slice(0, 3)}: ${slot(openDays[0])}` : summary;
}

export function instagramUrl(handle?: string | null): string {
  const safe = (handle ?? "").trim();
  if (!safe) return "https://www.instagram.com/mstudiohairdresser/";
  if (safe.startsWith("http://") || safe.startsWith("https://")) return safe;
  const clean = safe.replace(/^@/, "");
  return `https://www.instagram.com/${clean}/`;
}

export function tikTokUrl(handle?: string | null): string {
  const safe = (handle ?? "").trim();
  if (!safe) return "https://www.tiktok.com/@mehmetiis";
  if (safe.startsWith("http://") || safe.startsWith("https://")) return safe;
  const clean = safe.replace(/^@/, "");
  return `https://www.tiktok.com/@${clean}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
