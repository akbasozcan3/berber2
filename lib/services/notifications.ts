import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const listeners = new Set<(data: string) => void>();

export function addNotificationListener(listener: (data: string) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function broadcast(event: object) {
  const data = JSON.stringify(event);
  listeners.forEach((l) => l(data));
}

export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  meta?: Record<string, unknown>;
}) {
  const timestamp = new Date().toISOString();
  const [notification] = await db
    .insert(notifications)
    .values({
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.meta ? JSON.stringify(data.meta) : null,
      read: false,
      createdAt: timestamp,
    })
    .returning();

  broadcast({ type: "notification", notification });
  return notification;
}

export async function getNotifications(limit = 50) {
  return db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function getUnreadCount() {
  const result = await db
    .select()
    .from(notifications)
    .where(eq(notifications.read, false));
  return result.length;
}

export async function markAsRead(id: number) {
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  broadcast({ type: "notification_read", id });
}

export async function markAllAsRead() {
  await db.update(notifications).set({ read: true }).where(eq(notifications.read, false));
  broadcast({ type: "all_read" });
}

export async function deleteNotification(id: number) {
  await db.delete(notifications).where(eq(notifications.id, id));
  broadcast({ type: "notification_deleted", id });
}
