type DbErrorLike = Error & { cause?: unknown; code?: string };

function collectMessages(error: unknown): string[] {
  const messages: string[] = [];
  let current: unknown = error;
  let depth = 0;

  while (current && depth < 4) {
    if (current instanceof Error) {
      if (current.message) messages.push(current.message);
      if ("code" in current && typeof current.code === "string") {
        messages.push(current.code);
      }
      current = current.cause;
    } else if (typeof current === "string") {
      messages.push(current);
      break;
    } else {
      break;
    }
    depth += 1;
  }

  return messages;
}

export function formatDbError(error: unknown, fallback = "Veritabanı işlemi başarısız."): string {
  const text = collectMessages(error).join(" ").toLowerCase();

  if (text.includes("duplicate key") || text.includes("unique constraint") || text.includes("23505")) {
    return "Bu kayıt zaten var (aynı slug veya benzersiz alan tekrar ediyor).";
  }
  if (text.includes('relation "barbers" does not exist') || text.includes("does not exist")) {
    return "Veritabanı tabloları eksik. Bilgisayarınızda Vercel DATABASE_URL ile npm run db:setup çalıştırın.";
  }
  if (text.includes("column") && text.includes("does not exist")) {
    return "Veritabanı şeması güncel değil. Bilgisayarınızda npm run db:migrate çalıştırın.";
  }
  if (text.includes("permission denied") || text.includes("read-only") || text.includes("42501")) {
    return "DATABASE_URL yazma izni vermiyor. Vercel Storage'dan POSTGRES_URL (pooled) kopyalayın.";
  }
  if (text.includes("db_not_configured") || text.includes("db_connection_failed")) {
    return "Veritabanı bağlantısı kurulamadı. DATABASE_URL değerini kontrol edin.";
  }
  if (text.includes("failed query")) {
    return "Veritabanı sorgusu başarısız. Büyük olasılıkla tablolar kurulmamış — npm run db:setup çalıştırın.";
  }

  if (error instanceof Error && error.message && error.message.length < 180) {
    return error.message;
  }

  return fallback;
}
