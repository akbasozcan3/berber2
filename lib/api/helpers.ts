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
