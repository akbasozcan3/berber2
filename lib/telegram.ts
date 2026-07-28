import { db } from "@/lib/db";
import { telegramLogs } from "@/lib/db/schema";
import { getSetting, setSetting } from "@/lib/services/booking";

function isGroupChatId(chatId: string): boolean {
  return chatId.trim().startsWith("-");
}

export interface TelegramAppointmentData {
  customerName: string;
  phone: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  notes?: string;
}

export interface TelegramResult {
  success: boolean;
  messageId?: number;
  error?: string;
  skipped?: boolean;
}

export interface TelegramContactData {
  name: string;
  email: string;
  message: string;
}

interface TelegramApiResponse {
  ok: boolean;
  description?: string;
  result?: { message_id?: number };
}

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [0, 400, 900];
const REQUEST_TIMEOUT_MS = 12_000;
const TEST_MESSAGE = "Telegram bağlantısı başarılı.";

class TelegramConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelegramConfigError";
  }
}

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    throw new TelegramConfigError("TELEGRAM_BOT_TOKEN is not configured on the server.");
  }
  return token;
}

async function getChatId(): Promise<string> {
  const fromDb = (await getSetting("telegram_chat_id"))?.trim();
  if (fromDb) return fromDb;

  const fromEnv = process.env.TELEGRAM_CHAT_ID?.trim();
  if (fromEnv) return fromEnv;

  throw new TelegramConfigError(
    "TELEGRAM_CHAT_ID is not configured. Bot'a /start yazın veya admin ayarlarından Chat ID girin."
  );
}

async function isEnabled(): Promise<boolean> {
  return true;
}

async function verifyBotConnection(): Promise<{ connected: boolean; botUsername?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return { connected: false };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      signal: AbortSignal.timeout(8_000),
    });
    const data = (await response.json()) as {
      ok: boolean;
      result?: { username?: string };
    };
    if (!data.ok) return { connected: false };
    return { connected: true, botUsername: data.result?.username };
  } catch {
    return { connected: false };
  }
}

export async function getTelegramStatus() {
  const tokenConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  const chatId = (await getSetting("telegram_chat_id"))?.trim() || process.env.TELEGRAM_CHAT_ID?.trim() || "";
  const chatIdConfigured = Boolean(chatId);

  const enabled = true;
  const bot = await verifyBotConnection();
  const recipientName =
    (await getSetting("telegram_recipient_name"))?.trim() || "Mehmet Abi";
  const lastTestAt = (await getSetting("telegram_last_test_at"))?.trim() || null;
  const chatTarget = chatId ? (isGroupChatId(chatId) ? "group" : "private") : "none";

  return {
    enabled,
    tokenConfigured,
    chatIdConfigured,
    chatId: chatId || null,
    chatTarget,
    connected: bot.connected && tokenConfigured,
    botUsername: bot.botUsername ?? null,
    recipientName,
    lastTestAt,
    ready: bot.connected && tokenConfigured && chatIdConfigured,
  };
}

function formatAppointmentDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildAppointmentMessage(data: TelegramAppointmentData): string {
  const notes = data.notes?.trim() || "Not yok";

  return `YENI RANDEVU

Müşteri
${data.customerName}

Telefon
${data.phone}

Hizmet
${data.service}

Berber
${data.barber}

Tarih
${formatAppointmentDate(data.date)}

Saat
${data.time}

Not
${notes}`;
}

function buildContactMessage(data: TelegramContactData): string {
  return `YENI ILETISIM MESAJI

Ad Soyad
${data.name}

E-posta
${data.email}

Mesaj
${data.message.trim()}`;
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<TelegramApiResponse> {
  const token = getBotToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const result = (await response.json()) as TelegramApiResponse;

    if (!response.ok || !result.ok) {
      throw new Error(result.description || `Telegram API error (${response.status})`);
    }

    return result;
  } catch (err) {
    if (err instanceof TelegramConfigError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Telegram request timed out after 12 seconds.");
    }
    throw err instanceof Error ? err : new Error("Telegram request failed.");
  } finally {
    clearTimeout(timeout);
  }
}

async function logMessage(data: {
  appointmentId?: number;
  chatId: string;
  message: string;
  status: string;
  response?: string;
  retryCount?: number;
}) {
  await db.insert(telegramLogs).values({
    appointmentId: data.appointmentId ?? null,
    chatId: data.chatId,
    message: data.message,
    status: data.status,
    response: data.response ?? null,
    retryCount: data.retryCount ?? 0,
    createdAt: new Date().toISOString(),
  });
}

export async function sendTelegramNotification(
  data: TelegramAppointmentData,
  appointmentId?: number
): Promise<TelegramResult> {
  if (!(await isEnabled())) {
    return { success: true, skipped: true };
  }

  let chatId: string;
  try {
    chatId = await getChatId();
    getBotToken();
  } catch (err) {
    const error = err instanceof Error ? err.message : "Telegram configuration error";
    console.error("[Telegram]", error);
    await logMessage({
      appointmentId,
      chatId: "—",
      message: "Configuration error",
      status: "failed",
      response: error,
      retryCount: 0,
    });
    return { success: false, error };
  }

  const message = buildAppointmentMessage(data);
  let lastError = "Unknown Telegram error";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }

    try {
      const result = await sendTelegramMessage(chatId, message);
      await logMessage({
        appointmentId,
        chatId,
        message,
        status: "sent",
        response: JSON.stringify(result),
        retryCount: attempt,
      });
      return { success: true, messageId: result.result?.message_id };
    } catch (err) {
      lastError = err instanceof Error ? err.message : lastError;
      console.error(`[Telegram] Attempt ${attempt + 1} failed:`, lastError);
    }
  }

  await logMessage({
    appointmentId,
    chatId,
    message,
    status: "failed",
    response: lastError,
    retryCount: MAX_RETRIES,
  });

  return { success: false, error: lastError };
}

export async function sendTestConnection(): Promise<TelegramResult> {
  let chatId: string;
  try {
    chatId = await getChatId();
    getBotToken();
  } catch (err) {
    const error = err instanceof Error ? err.message : "Telegram configuration error";
    return { success: false, error };
  }

  try {
    const result = await sendTelegramMessage(chatId, TEST_MESSAGE);
    await logMessage({
      chatId,
      message: TEST_MESSAGE,
      status: "sent",
      response: JSON.stringify(result),
      retryCount: 0,
    });
    await setSetting("telegram_last_test_at", new Date().toISOString());
    return { success: true, messageId: result.result?.message_id };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Test connection failed";
    await logMessage({
      chatId,
      message: TEST_MESSAGE,
      status: "failed",
      response: error,
      retryCount: 0,
    });
    return { success: false, error };
  }
}

export async function sendTelegramContactNotification(
  data: TelegramContactData
): Promise<TelegramResult> {
  if (!(await isEnabled())) {
    return { success: true, skipped: true };
  }

  let chatId: string;
  try {
    chatId = await getChatId();
    getBotToken();
  } catch (err) {
    const error = err instanceof Error ? err.message : "Telegram configuration error";
    return { success: false, error };
  }

  const message = buildContactMessage(data);
  try {
    const result = await sendTelegramMessage(chatId, message);
    await logMessage({
      chatId,
      message,
      status: "sent",
      response: JSON.stringify(result),
      retryCount: 0,
    });
    return { success: true, messageId: result.result?.message_id };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Telegram request failed";
    await logMessage({
      chatId,
      message,
      status: "failed",
      response: error,
      retryCount: 0,
    });
    return { success: false, error };
  }
}

export async function getTelegramLogs(limit = 50) {
  const { desc } = await import("drizzle-orm");
  return db.select().from(telegramLogs).orderBy(desc(telegramLogs.createdAt)).limit(limit);
}
