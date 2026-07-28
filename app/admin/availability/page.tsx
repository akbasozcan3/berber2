"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Ban, Calendar, Clock, RotateCcw, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Select from "@/components/admin/ui/Select";
import BarberDaySchedule from "@/components/admin/BarberDaySchedule";
import { adminApi, type AvailabilityBlock, type AdminBarber } from "@/lib/api/admin";
import { formatDate } from "@/lib/admin/utils";
import { cn } from "@/lib/admin/cn";
import { formatAvailabilityRule, RULE_TYPE_LABELS } from "@/lib/admin/availability-labels";
import { blocksActiveOnDate } from "@/lib/admin/barber-day-status";
import { toLocalIsoDate } from "@/lib/utils/format";

const REASONS = [
  { value: "İş çıktı", label: "İş çıktı" },
  { value: "Kişisel İzin", label: "Kişisel İzin" },
  { value: "Tatil", label: "Tatil" },
  { value: "Bayram", label: "Bayram" },
  { value: "Acil Durum", label: "Acil Durum" },
  { value: "Mola", label: "Mola" },
  { value: "Diğer", label: "Diğer" },
];

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/20 border-green-500/30 text-green-400",
  closed: "bg-red-500/20 border-red-500/30 text-red-400",
  limited: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
  holiday: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  past: "bg-zinc-500/20 border-zinc-500/30 text-zinc-500",
};

export default function AvailabilityPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [audit, setAudit] = useState<{ id: number; adminName: string; action: string; reason: string | null; createdAt: string }[]>([]);
  const [monthStatuses, setMonthStatuses] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => toLocalIsoDate());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState(() => {
    const today = toLocalIsoDate();
    return {
      startDate: today,
      endDate: today,
      reason: "Tatil",
      barberId: "",
      blockStart: "15:00",
      blockEnd: "16:00",
      customOpen: "09:00",
      customClose: "20:00",
      earlyClose: "16:00",
      lateOpen: "13:00",
    };
  });

  const load = useCallback(async () => {
    const [b, bar, a, m] = await Promise.all([
      adminApi.getAvailability(),
      adminApi.getBarbers(),
      fetch("/api/v1/admin/availability?audit=true", { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/v1/admin/availability?month=${currentMonth}`, { credentials: "include" }).then((r) => r.json()),
    ]);
    setBlocks(b);
    setBarbers(bar);
    setAudit(a);
    setMonthStatuses(m);
  }, [currentMonth]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const postAction = async (body: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/availability", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || "Müsaitlik güncellendi.", true);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Hata oluştu", false);
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (id: number) => {
    setLoading(true);
    try {
      await adminApi.deleteAvailability(id);
      showToast("Kural kaldırıldı.", true);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Silinemedi", false);
    } finally {
      setLoading(false);
    }
  };

  const closeBarberDay = (barberId: number | null, reason: string) => {
    void postAction({
      ruleType: "close_day",
      date: scheduleDate,
      endDate: scheduleDate,
      reason,
      barberId,
    });
  };

  const openBarberDay = async (barberId: number | null) => {
    const dayBlocks = blocksActiveOnDate(blocks, scheduleDate);
    const toRemove = dayBlocks.filter((b) =>
      barberId === null ? !b.barberId : b.barberId === barberId
    );
    if (toRemove.length === 0) {
      showToast("Kaldırılacak kural yok.", false);
      return;
    }
    setLoading(true);
    try {
      for (const b of toRemove) {
        await adminApi.deleteAvailability(b.id);
      }
      showToast("Müsaitlik açıldı.", true);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Hata oluştu", false);
    } finally {
      setLoading(false);
    }
  };

  const blockBarberHours = (barberId: number, start: string, end: string, reason: string) => {
    void postAction({
      ruleType: "block",
      date: scheduleDate,
      endDate: scheduleDate,
      startTime: start,
      endTime: end,
      reason,
      barberId,
    });
  };

  const barberName = (id: number | null) =>
    id ? barbers.find((b) => b.id === id)?.name || `Berber #${id}` : "Tüm salon";

  const [year, month] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const pickCalendarDay = (dateStr: string) => {
    setScheduleDate(dateStr);
    setForm((f) => ({ ...f, startDate: dateStr, endDate: dateStr }));
  };

  return (
    <div>
      <PageHeader
        title="Berber Müsaitliği"
        description="Hangi berber hangi gün müsait — iş çıktı, izin veya saat kapatma"
      />

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mb-6 p-4 rounded-xl flex items-center gap-3 text-sm border",
            toast.ok
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          <CheckCircle size={18} /> {toast.text}
        </motion.div>
      )}

      <BarberDaySchedule
        date={scheduleDate}
        onDateChange={(d) => {
          setScheduleDate(d);
          setForm((f) => ({ ...f, startDate: d, endDate: d }));
        }}
        barbers={barbers}
        blocks={blocks}
        loading={loading}
        onCloseBarberDay={closeBarberDay}
        onOpenBarberDay={openBarberDay}
        onBlockHours={blockBarberHours}
        onDeleteRule={deleteRule}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2">
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C8703A]" /> Aylık Takvim
          </h3>
          <p className="text-xs text-[#71717A] mb-4">Güne tıklayın — o günün berber durumunu yukarıda düzenleyin</p>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const d = new Date(year, month - 2, 1);
                setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
              }}
            >
              ←
            </Button>
            <span className="text-sm font-medium text-[#F8F8F8]">
              {new Date(year, month - 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const d = new Date(year, month, 1);
                setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
              }}
            >
              →
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
              <div key={d} className="text-center text-[10px] text-[#71717A] font-bold py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const status = monthStatuses[dateStr] || "available";
              const selected = scheduleDate === dateStr;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => pickCalendarDay(dateStr)}
                  className={cn(
                    "aspect-square rounded-lg border text-xs font-medium transition-all hover:scale-105",
                    STATUS_COLORS[status] || STATUS_COLORS.available,
                    selected && "ring-2 ring-[#C8703A] ring-offset-2 ring-offset-[#121212]"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4 flex items-center gap-2">
            <Ban className="w-4 h-4 text-[#C8703A]" /> Toplu İşlemler
          </h3>
          <div className="space-y-2">
            {[
              { label: "Bugünü Kapat", scope: "today" },
              { label: "Yarını Kapat", scope: "tomorrow" },
              { label: "Bu Haftayı Kapat", scope: "this_week" },
            ].map((a) => (
              <Button
                key={a.scope}
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
                onClick={() => {
                  if (window.confirm(`${a.label} — tüm salon kapatılacak. Emin misiniz?`)) {
                    void postAction({ scope: a.scope, ruleType: "close_day", reason: "Kapalı" });
                  }
                }}
              >
                {a.label} (tüm salon)
              </Button>
            ))}
            <Button
              variant="outline"
              className="w-full justify-start text-green-400 border-green-500/20"
              disabled={loading}
              onClick={() => {
                if (window.confirm("Tüm kapalı gün kuralları kaldırılacak. Emin misiniz?")) {
                  void postAction({ action: "open_all" });
                }
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Her Şeyi Aç
            </Button>
          </div>
        </Card>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-[#71717A] hover:text-[#A1A1AA] mb-4"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        Gelişmiş ayarlar (tarih aralığı, özel saatler)
      </button>

      {showAdvanced && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <Card>
            <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Tarih Aralığı Kapat</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input label="Başlangıç" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <Input label="Bitiş" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <Select label="Sebep" options={REASONS} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="mb-3" />
            <Select
              label="Berber"
              options={[{ value: "", label: "Tüm Salon" }, ...barbers.map((b) => ({ value: String(b.id), label: b.name }))]}
              value={form.barberId}
              onChange={(e) => setForm({ ...form, barberId: e.target.value })}
              className="mb-4"
            />
            <Button
              disabled={loading || !form.startDate}
              onClick={() =>
                postAction({
                  ruleType: "close_day",
                  date: form.startDate,
                  endDate: form.endDate || form.startDate,
                  reason: form.reason,
                  barberId: form.barberId ? Number(form.barberId) : null,
                })
              }
              className="w-full"
            >
              Aralığı Kapat
            </Button>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-[#F8F8F8] mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C8703A]" /> Özel Çalışma Saatleri
            </h3>
            <p className="text-xs text-[#71717A] mb-4">Seçili gün: {formatDate(form.startDate)}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input label="Açılış" type="time" value={form.customOpen} onChange={(e) => setForm({ ...form, customOpen: e.target.value })} />
              <Input label="Kapanış" type="time" value={form.customClose} onChange={(e) => setForm({ ...form, customClose: e.target.value })} />
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={loading || !form.startDate}
              onClick={() =>
                postAction({
                  ruleType: "hours_override",
                  date: form.startDate,
                  endDate: form.startDate,
                  customOpen: form.customOpen,
                  customClose: form.customClose,
                  reason: "Özel Saatler",
                })
              }
            >
              Saatleri Uygula
            </Button>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Aktif Kurallar ({blocks.length})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {blocks.length === 0 ? (
              <p className="text-xs text-[#52525B]">Aktif kural yok — herkes müsait.</p>
            ) : (
              blocks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 p-3 bg-[#0D1117] rounded-xl border border-white/[0.06]"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-[#F8F8F8] truncate">{formatAvailabilityRule(b)}</p>
                    <p className="text-xs text-[#71717A]">
                      {RULE_TYPE_LABELS[b.ruleType] || b.ruleType}
                      {b.barberId ? ` · ${barberName(b.barberId)}` : " · Tüm salon"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0" onClick={() => deleteRule(b.id)}>
                    Kaldır
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Son İşlemler</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {audit.slice(0, 20).map((a) => (
              <div key={a.id} className="p-3 bg-[#0D1117] rounded-xl border border-white/[0.06]">
                <p className="text-sm text-[#F8F8F8]">{a.action}</p>
                <p className="text-xs text-[#71717A]">
                  {a.adminName} · {formatDate(a.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
