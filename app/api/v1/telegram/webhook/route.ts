import { handleTelegramUpdate } from "@/lib/telegram-bot";
import type { TelegramUpdate } from "@/lib/telegram-bot";

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    await handleTelegramUpdate(update);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[Telegram Webhook]", err instanceof Error ? err.message : err);
    return new Response("Error", { status: 500 });
  }
}
