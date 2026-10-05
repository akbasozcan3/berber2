import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { randomUUID } from "crypto";
import { getSetting } from "./booking";
import {
  buildAppointmentConfirmedHtml,
  buildAppointmentConfirmedSubject,
  buildAppointmentConfirmedText,
  type AppointmentConfirmedEmailData,
} from "@/lib/email/appointment-confirmed";
import {
  buildAppointmentCancelledHtml,
  buildAppointmentCancelledSubject,
  buildAppointmentCancelledText,
  type AppointmentCancelledEmailData,
} from "@/lib/email/appointment-cancelled";

export interface EmailResult {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
}

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  isGmail: boolean;
};

function getSmtpConfig(): SmtpConfig | null {
  const host = (process.env.SMTP_HOST?.trim() || "smtp.gmail.com").toLowerCase();
  const portRaw = process.env.SMTP_PORT?.trim() || "587";
  const port = Number(portRaw.replace(/[^\d]/g, "")) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim()?.replace(/\s+/g, "");
  let from = process.env.SMTP_FROM?.trim() || user || "";

  if (!user || !pass) {
    console.error("[Email] SMTP_USER or SMTP_PASS missing");
    return null;
  }

  const isGmail = host.includes("gmail.com") || user.toLowerCase().endsWith("@gmail.com");

  // Gmail: From, kimlik doğrulanan hesapla birebir aynı olmalı (spam / reject önlemi).
  if (isGmail) {
    from = user;
  }

  return { host, port, user, pass, from, isGmail };
}

function createTransporter(config: SmtpConfig): Transporter {
  if (config.isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  const secure = config.port === 465;
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure,
    requireTLS: !secure && config.port === 587,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

function normalizeRecipient(to: string): string {
  return to.trim().toLowerCase();
}

function sanitizeDisplayName(name: string): string {
  return name.replace(/[\r\n"<>]/g, "").trim().slice(0, 64) || "Salon";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function messageIdFor(fromEmail: string): string {
  const domain = fromEmail.split("@")[1] || "mail.local";
  return `<${randomUUID()}@${domain}>`;
}

function formatSmtpError(err: unknown): string {
  if (!(err instanceof Error)) return "E-posta gönderilemedi";
  const message = err.message || "E-posta gönderilemedi";
  const lower = message.toLowerCase();

  if (lower.includes("invalid login") || lower.includes("badcredentials") || lower.includes("username and password")) {
    return "SMTP giriş hatası: Gmail uygulama şifresini kontrol edin (SMTP_PASS).";
  }
  if (lower.includes("econnrefused") || lower.includes("etimedout") || lower.includes("timeout")) {
    return "SMTP bağlantı zaman aşımı. SMTP_HOST / SMTP_PORT değerlerini kontrol edin.";
  }
  if (lower.includes("self signed") || lower.includes("certificate")) {
    return "SMTP TLS sertifika hatası.";
  }
  return message.slice(0, 200);
}

async function deliverMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<EmailResult> {
  const recipient = normalizeRecipient(options.to);
  if (!recipient || !recipient.includes("@")) {
    return { sent: false, skipped: true, reason: "Müşteri e-postası yok" };
  }

  const config = getSmtpConfig();
  if (!config?.from) {
    return { sent: false, skipped: true, reason: "SMTP yapılandırması eksik (SMTP_USER / SMTP_PASS)" };
  }

  const mailer = createTransporter(config);
  const businessName = sanitizeDisplayName(
    (await getSetting("business_name"))?.trim() || "M Studio Hairdresser"
  );
  const contactEmail = (await getSetting("contact_email"))?.trim().toLowerCase() || "";
  const replyTo =
    contactEmail && isValidEmail(contactEmail) ? contactEmail : config.from;
  const siteUrl = (await getSetting("site_url"))?.trim().replace(/\/$/, "") || "";
  const unsubscribeMailto = `mailto:${replyTo}?subject=${encodeURIComponent("Bildirim tercihi")}`;

  try {
    const info = await mailer.sendMail({
      from: {
        name: businessName,
        address: config.from,
      },
      // Envelope From = auth kullanıcısı → SPF/DKIM uyumu, spam riski düşer
      envelope: {
        from: config.user,
        to: recipient,
      },
      sender: config.from,
      replyTo,
      to: recipient,
      subject: options.subject,
      text: options.text,
      html: options.html,
      messageId: messageIdFor(config.from),
      date: new Date(),
      encoding: "utf-8",
      priority: "normal",
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
        "X-Entity-Ref-ID": randomUUID(),
        "List-Unsubscribe": `<${unsubscribeMailto}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        ...(siteUrl ? { "X-Business-URL": siteUrl } : {}),
      },
    });

    console.info("[Email] Sent OK", {
      to: recipient,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
    });
    return { sent: true };
  } catch (err) {
    const error = formatSmtpError(err);
    console.error("[Email] Send failed:", error, err);
    return { sent: false, error };
  } finally {
    mailer.close();
  }
}

export async function sendAppointmentConfirmedEmail(
  to: string,
  data: AppointmentConfirmedEmailData
): Promise<EmailResult> {
  return deliverMail({
    to,
    subject: buildAppointmentConfirmedSubject(data),
    text: buildAppointmentConfirmedText(data),
    html: buildAppointmentConfirmedHtml(data),
  });
}

export async function sendAppointmentCancelledEmail(
  to: string,
  data: AppointmentCancelledEmailData
): Promise<EmailResult> {
  return deliverMail({
    to,
    subject: buildAppointmentCancelledSubject(data),
    text: buildAppointmentCancelledText(data),
    html: buildAppointmentCancelledHtml(data),
  });
}

export async function sendTestEmail(to?: string): Promise<EmailResult> {
  const config = getSmtpConfig();
  if (!config) {
    return { sent: false, skipped: true, reason: "SMTP yapılandırması eksik (SMTP_USER / SMTP_PASS)" };
  }

  const recipient = normalizeRecipient(to || config.user);
  const businessName = sanitizeDisplayName(
    (await getSetting("business_name"))?.trim() || "M Studio Hairdresser"
  );

  return deliverMail({
    to: recipient,
    subject: `${businessName} e-posta testi`,
    text: `Merhaba,\n\nBu mesaj ${businessName} SMTP ayarlarının çalıştığını doğrulamak için gönderildi.\n\n${businessName}`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111827;line-height:1.6;max-width:520px">
      <p style="margin:0 0 12px">Merhaba,</p>
      <p style="margin:0 0 12px;color:#4B5563">Bu mesaj <strong>${businessName}</strong> SMTP ayarlarının çalıştığını doğrulamak için gönderildi.</p>
      <p style="margin:0;color:#9CA3AF;font-size:12px">${businessName}</p>
    </div>`,
  });
}

export async function getEmailStatus(): Promise<{
  configured: boolean;
  enabled: boolean;
  host?: string;
  user?: string;
  from?: string;
}> {
  const config = getSmtpConfig();
  return {
    configured: Boolean(config),
    enabled: true,
    host: config?.host,
    user: config?.user,
    from: config?.from,
  };
}
