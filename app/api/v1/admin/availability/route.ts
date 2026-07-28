import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { availabilityBlocks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { createNotification } from "@/lib/services/notifications";
import {
  createAvailabilityRule,
  deactivateAllRules,
  getAuditLog,
  getDateRangeForScope,
  getDayStatus,
  logAvailabilityChange,
  type QuickScope,
  type RuleType,
} from "@/lib/services/availability";

export async function GET(request: Request) {
  try {
    await ensureDb();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const audit = searchParams.get("audit");

    if (audit === "true") {
      await requireAuth();
      return jsonResponse(await getAuditLog(100));
    }

    if (month) {
      const [year, m] = month.split("-").map(Number);
      const daysInMonth = new Date(year, m, 0).getDate();
      const statuses: Record<string, string> = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        statuses[dateStr] = await getDayStatus(dateStr);
      }
      return jsonResponse(statuses);
    }

    if (date) {
      const blocks = await db
        .select()
        .from(availabilityBlocks)
        .where(eq(availabilityBlocks.active, true));
      const filtered = blocks.filter((b) => {
        const end = b.endDate || b.date;
        return date >= b.date && date <= end;
      });
      return jsonResponse(filtered);
    }

    await requireAuth();
    const blocks = await db.select().from(availabilityBlocks).where(eq(availabilityBlocks.active, true));
    return jsonResponse(blocks);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    const session = await requireAuth();
    const body = await parseBody<{
      action?: string;
      ruleType?: RuleType;
      scope?: QuickScope;
      date?: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
      customOpen?: string;
      customClose?: string;
      reason?: string;
      barberId?: number | null;
    }>(request);

    if (body.action === "open_all") {
      const count = await deactivateAllRules();
      await logAvailabilityChange({
        adminName: session.name,
        action: "Tüm müsaitlik kuralları kaldırıldı",
        newState: { deactivated: count },
        reason: "Open Everything",
      });
      await createNotification({ type: "availability", title: "Müsaitlik Güncellendi", message: "Tüm kısıtlamalar kaldırıldı. Randevular açık." });
      return jsonResponse({ success: true, message: "Müsaitlik güncellendi." });
    }

    let date = body.date || "";
    let endDate = body.endDate;

    if (body.scope) {
      const range = getDateRangeForScope(body.scope);
      date = range.start;
      endDate = range.end;
    }

    if (!date) return errorResponse("Tarih gerekli", 400);

    const ruleType = body.ruleType || (body.scope === "permanent" ? "permanent" : "close_day");

    const created = await createAvailabilityRule({
      ruleType,
      date,
      endDate,
      startTime: body.startTime,
      endTime: body.endTime,
      customOpen: body.customOpen,
      customClose: body.customClose,
      scope: body.scope,
      reason: body.reason || "Kapalı",
      barberId: body.barberId,
      createdBy: session.name,
    });

    await logAvailabilityChange({
      adminName: session.name,
      action: `Müsaitlik kuralı eklendi: ${ruleType}`,
      newState: created,
      reason: body.reason,
    });

    await createNotification({
      type: "availability",
      title: "Müsaitlik Güncellendi",
      message: `${date}${endDate && endDate !== date ? ` - ${endDate}` : ""}: ${body.reason || "Kapalı"}`,
    });

    return jsonResponse({ success: true, blocks: created, message: "Müsaitlik güncellendi." }, 201);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Oluşturulamadı", 500);
  }
}
