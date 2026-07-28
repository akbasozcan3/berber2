import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { addNotificationListener } from "@/lib/services/notifications";
import { errorResponse } from "@/lib/api/helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const encoder = new TextEncoder();
  let closed = false;
  let removeListener: (() => void) | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // Controller kapandıysa sessizce yoksay
          cleanup();
        }
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
        if (removeListener) {
          removeListener();
          removeListener = null;
        }
        try {
          controller.close();
        } catch {
          // Zaten kapalıysa yoksay
        }
      };

      // Bağlantı mesajı
      send(JSON.stringify({ type: "connected" }));

      // Bildirim dinleyicisi
      removeListener = addNotificationListener(send);

      // Heartbeat — 25 saniyede bir (proxy timeout'ları için)
      heartbeatTimer = setInterval(() => {
        send(JSON.stringify({ type: "heartbeat" }));
      }, 25000);

      // Stream iptal edildiğinde temizle
      return cleanup;
    },
    cancel() {
      closed = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (removeListener) removeListener();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
