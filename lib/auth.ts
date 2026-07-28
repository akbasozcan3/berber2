import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "newlife-super-secret-key-change-in-production"
);

const COOKIE_NAME = "newlife_admin_token";
const ALLOWED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const ALLOWED_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export function isDefaultJwtSecret(): boolean {
  return !process.env.JWT_SECRET?.trim();
}

async function verifyAdminPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;

  try {
    const rows = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    const user = rows[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, email: user.email, name: user.name || "Admin" };
    }
  } catch {
    // DB unavailable — env fallback below
  }

  if (
    ALLOWED_ADMIN_EMAIL &&
    ALLOWED_ADMIN_PASSWORD &&
    normalizedEmail === ALLOWED_ADMIN_EMAIL &&
    password === ALLOWED_ADMIN_PASSWORD
  ) {
    return { id: 1, email: ALLOWED_ADMIN_EMAIL, name: "Admin" };
  }

  return null;
}

export async function login(email: string, password: string) {
  const admin = await verifyAdminPassword(email, password);
  if (!admin) {
    throw new Error("Geçersiz e-posta veya şifre.");
  }

  const token = await new SignJWT({ sub: String(admin.id), email: admin.email, name: admin.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return { token, user: { id: admin.id, name: admin.name, email: admin.email } };
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const email = String(payload.email || "").toLowerCase();
    if (!email) return null;
    return {
      id: Number(payload.sub),
      email,
      name: String(payload.name || "Admin"),
    };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  const isHttps =
    process.env.NODE_ENV === "production" &&
    (Boolean(process.env.VERCEL) ||
      Boolean(process.env.HTTPS_ENABLED) ||
      (process.env.SITE_URL || "").startsWith("https://"));

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export { COOKIE_NAME, JWT_SECRET };
