import { db } from "@/lib/db";
import { telegramLogs } from "@/lib/db/schema";
import { getSetting, setSetting } from "@/lib/services/booking";

/**
 * Telegram Chat ID'yi normalize eder.
 * Grup/supergroup ID'leri genelde -100... şeklindedir; eksi unutulunca
 * "Bad Request: chat not found" hatası alınır.
 */
export function normalizeTelegramChatId(raw: string): string {
  let id = raw.trim().replace(/\s+/g, "");
  if (!id) return "";

  // Sadece rakam ve opsiyonel baştaki eksi
  id = id.replace(/[^\d-]/g, "");
  if (id.startsWith("--")) id = `-${id.replace(/^-+/, "")}`;

  // 100 ile başlayan uzun ID'ler (eksi yoksa) grup ID'sidir
  if (!id.startsWith("-") && /^100\d{9,}$/.test(id)) {
    return `-${id}`;
  }

  return id;
}

export function isGroupChatId(chatId: string): boolean {
  const id = normalizeTelegramChatId(chatId);
  return id.startsWith("-");
}

function humanizeTelegramError(raw: string, chatId: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("chat not found")) {
    const hint = isGroupChatId(chatId)
      ? "Grup Chat ID yanlış olabilir veya bot gruba eklenmemiş. Botu gruba ekleyip grupta /start yazın."
      : "Bot size mesaj gönderemiyor. Telegram'da bota /start yazın veya doğru Chat ID girin. Grup için ID -100... ile başlamalı.";
    return `Sohbet bulunamadı (chat not found). ${hint}`;
  }
  if (msg.includes("bot was blocked")) {
    return "Bot engellenmiş. Telegram'da botu engeli kaldırıp /start yazın.";
  }
  if (msg.includes("forbidden")) {
    return "Bot bu sohbete mesaj gönderemiyor. Botu gruba ekleyin veya kişisel sohbette /start yazın.";
  }
  if (msg.includes("unauthorized") || msg.includes("token")) {
    return "Bot token geçersiz. Vercel ortam değişkeninde TELEGRAM_BOT_TOKEN'ı kontrol edin.";
  }
  return raw;
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
  const fromDb = normalizeTelegramChatId((await getSetting("telegram_chat_id")) || "");
  if (fromDb) return fromDb;

  const fromEnv = normalizeTelegramChatId(process.env.TELEGRAM_CHAT_ID || "");
  if (fromEnv) return fromEnv;

  throw new TelegramConfigError(
    "Chat ID ayarlı değil. Bot'a /start yazın veya Ayarlar → Telegram → Gelişmiş ayarlardan Chat ID girin."
  );
}

/** DB'deki hatalı chat ID'yi (eksi unutulmuş grup ID vb.) kalıcı düzelt. */
async function persistNormalizedChatId(normalized: string): Promise<void> {
  if (!normalized) return;
  const current = ((await getSetting("telegram_chat_id")) || "").trim();
  if (current === normalized) return;
  await setSetting("telegram_chat_id", normalized);
}

function chatIdCandidates(primary: string): string[] {
  const main = normalizeTelegramChatId(primary);
  if (!main) return [];
  const candidates = [main];

  // Eksi eksik/fazla denemeleri (chat not found için)
  if (main.startsWith("-") && /^-\d+$/.test(main)) {
    candidates.push(main.slice(1));
  } else if (/^\d+$/.test(main)) {
    candidates.push(`-${main}`);
  }

  return [...new Set(candidates)];
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
  const rawChatId =
    (await getSetting("telegram_chat_id"))?.trim() || process.env.TELEGRAM_CHAT_ID?.trim() || "";
  const chatId = normalizeTelegramChatId(rawChatId);
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
  const candidates = chatIdCandidates(chatId);
  if (candidates.length === 0) {
    throw new TelegramConfigError("Geçersiz Chat ID.");
  }

  let lastError = "Telegram isteği başarısız.";

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const hasMore = i < candidates.length - 1;

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          chat_id: candidate,
          text,
          disable_web_page_preview: true,
        }),
      });

      const result = (await response.json()) as TelegramApiResponse;

      if (!response.ok || !result.ok) {
        const raw = result.description || `Telegram API error (${response.status})`;
        lastError = humanizeTelegramError(raw, candidate);
        if (raw.toLowerCase().includes("chat not found") && hasMore) continue;
        throw new Error(lastError);
      }

      await persistNormalizedChatId(candidate);
      return result;
    } catch (err) {
      if (err instanceof TelegramConfigError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Telegram isteği 12 saniyede zaman aşımına uğradı.");
      }
      const message = err instanceof Error ? err.message : lastError;
      lastError = humanizeTelegramError(message, candidate);
      if (message.toLowerCase().includes("chat not found") && hasMore) continue;
      throw new Error(lastError);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(lastError);
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
