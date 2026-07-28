import type { AppointmentStatus } from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  // YYYY-MM-DD string'ini doğrudan parse et, timezone kayması olmasın
  const [year, month, day] = date.length === 10
    ? date.split("-").map(Number)
    : [0, 0, 0];

  if (year && month && day) {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, day));
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: string): string {
  const [year, month, day] = date.length === 10
    ? date.split("-").map(Number)
    : [0, 0, 0];

  if (year && month && day) {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
    }).format(new Date(year, month - 1, day));
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  return time;
}

export const statusConfig: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  confirmed: {
    label: "Onaylandı",
    color: "#4ADE80",
    bg: "rgba(74, 222, 128, 0.1)",
    border: "rgba(74, 222, 128, 0.2)",
  },
  pending: {
    label: "Beklemede",
    color: "#FBBF24",
    bg: "rgba(251, 191, 36, 0.1)",
    border: "rgba(251, 191, 36, 0.2)",
  },
  completed: {
    label: "Tamamlandı",
    color: "#60A5FA",
    bg: "rgba(96, 165, 250, 0.1)",
    border: "rgba(96, 165, 250, 0.2)",
  },
  cancelled: {
    label: "İptal",
    color: "#F87171",
    bg: "rgba(248, 113, 113, 0.1)",
    border: "rgba(248, 113, 113, 0.2)",
  },
};

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getWeekDates(baseDate: Date = new Date()): Date[] {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}
