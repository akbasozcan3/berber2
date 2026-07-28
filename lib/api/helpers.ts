import { NextResponse } from "next/server";
import { ensureDb } from "@/lib/db/ensure";

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

/** Public GET routes: DB yoksa boş dizi/obje döner, 500 vermez. */
export async function publicDbHandler<T>(
  handler: () => Promise<T | NextResponse>,
  fallback: T
): Promise<NextResponse> {
  try {
    if (!(await ensureDb())) {
      return jsonResponse(fallback);
    }
    const result = await handler();
    if (result instanceof NextResponse) return result;
    return jsonResponse(result);
  } catch {
    return jsonResponse(fallback);
  }
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value?.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const EMPTY_DASHBOARD = {
  todayAppointments: 0,
  waitingCustomers: 0,
  completedToday: 0,
  revenueToday: 0,
  revenueMonth: 0,
} as const;

export function normalizeDashboardStats(data: unknown) {
  const row = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  return {
    todayAppointments: Number(row.todayAppointments) || 0,
    waitingCustomers: Number(row.waitingCustomers) || 0,
    completedToday: Number(row.completedToday) || 0,
    revenueToday: Number(row.revenueToday) || 0,
    revenueMonth: Number(row.revenueMonth) || 0,
  };
}
