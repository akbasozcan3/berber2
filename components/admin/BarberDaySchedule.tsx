"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Scissors, Store } from "lucide-react";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Input from "@/components/admin/ui/Input";
import Select from "@/components/admin/ui/Select";
import Avatar from "@/components/admin/ui/Avatar";
import { cn } from "@/lib/admin/cn";
import type { AdminBarber, AvailabilityBlock } from "@/lib/api/admin";
import {
  getBarberDayInfo,
  getSalonStatusForDate,
  type BarberDayStatus,
} from "@/lib/admin/barber-day-status";
import { formatIsoDateTr, toLocalIsoDate } from "@/lib/utils/format";

const REASONS = [
  { value: "Kişisel İzin", label: "Kişisel İzin" },
  { value: "İş çıktı", label: "İş çıktı" },
  { value: "Acil Durum", label: "Acil Durum" },
  { value: "Tatil", label: "Tatil" },
  { value: "Mola", label: "Mola" },
  { value: "Diğer", label: "Diğer" },
];

const STATUS_STYLES: Record<BarberDayStatus, string> = {
  available: "border-green-500/30 bg-green-500/10 text-green-400",
  closed: "border-red-500/30 bg-red-500/10 text-red-400",
  partial: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  vacation: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  inactive: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  salon_closed: "border-red-500/40 bg-red-500/15 text-red-300",
};

interface Props {
  date: string;
  onDateChange: (date: string) => void;
  barbers: AdminBarber[];
  blocks: AvailabilityBlock[];
  loading: boolean;
  onCloseBarberDay: (barberId: number | null, reason: string) => void;
  onOpenBarberDay: (barberId: number | null) => void;
  onBlockHours: (barberId: number, start: string, end: string, reason: string) => void;
  onDeleteRule: (id: number) => void;
}

export default function BarberDaySchedule({
  date,
  onDateChange,
  barbers,
  blocks,
  loading,
  onCloseBarberDay,
  onOpenBarberDay,
  onBlockHours,
  onDeleteRule,
}: Props) {
  const [reason, setReason] = useState("İş çıktı");
  const [expandedBarber, setExpandedBarber] = useState<number | null>(null);
  const [blockStart, setBlockStart] = useState("14:00");
  const [blockEnd, setBlockEnd] = useState("16:00");

  const shiftDate = (days: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    onDateChange(toLocalIsoDate(d));
  };

  const salon = getSalonStatusForDate(date, blocks);
  const dayLabel = formatIsoDateTr(date);
  const activeBarbers = barbers.filter((b) => b.available && !b.onVacation);

  return (
    <Card className="mb-6 border-[#C8703A]/25">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C8703A] mb-1">
            Günlük berber müsaitliği
          </p>
          <h3 className="text-xl font-semibold text-[#EEE9E0]">Kim müsait, kim değil?</h3>
          <p className="text-sm text-[#6B7A94] mt-1">
            Berberin işi çıktıysa sadece onu kapatın — diğerleri çalışmaya devam eder.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => shiftDate(-1)} aria-label="Önceki gün">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-[11.5rem]"
          />
          <Button variant="ghost" size="icon" onClick={() => shiftDate(1)} aria-label="Sonraki gün">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDateChange(toLocalIsoDate())}>
            Bugün
          </Button>
        </div>
      </div>

      <p className="text-sm text-[#8A9BB0] mb-4 font-medium">{dayLabel}</p>

      {/* Salon row */}
      <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0D1117] mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
              <Store className="w-5 h-5 text-[#C8703A]" />
            </div>
            <div>
              <p className="font-semibold text-[#EEE9E0]">Tüm Salon</p>
              <p className="text-xs text-[#6B7A94]">
                {salon.closed ? "O gün salon tamamen kapalı" : "Salon açık — berberleri ayrı ayarlayın"}
              </p>
            </div>
            <span
              className={cn(
                "ml-auto sm:ml-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border",
                salon.closed ? STATUS_STYLES.salon_closed : STATUS_STYLES.available
              )}
            >
              {salon.closed ? "Kapalı" : "Açık"}
            </span>
          </div>
          <div className="flex gap-2">
            {!salon.closed ? (
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => {
                  if (window.confirm(`${dayLabel} — tüm salon kapatılacak. Emin misiniz?`)) {
                    onCloseBarberDay(null, reason);
                  }
                }}
              >
                Salonu Kapat
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                className="text-green-400 border-green-500/30"
                onClick={() => {
                  if (salon.rule) onDeleteRule(salon.rule.id);
                  else onOpenBarberDay(null);
                }}
              >
                Salonu Aç
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 max-w-xs">
        <Select label="Kapalı sebep (varsayılan)" options={REASONS} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>

      {/* Barber cards */}
      {barbers.length === 0 ? (
        <p className="text-sm text-[#6B7A94] py-6 text-center">
          Henüz berber eklenmemiş. <strong className="text-[#8A9BB0]">Berberler</strong> sayfasından ekleyin.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {barbers.map((barber) => {
            const info = getBarberDayInfo(barber, date, blocks);
            const canToggle = !salon.closed && info.status !== "vacation" && info.status !== "inactive";
            const isExpanded = expandedBarber === barber.id;

            return (
              <div
                key={barber.id}
                className={cn(
                  "rounded-2xl border p-4 transition-all",
                  info.status === "available"
                    ? "border-white/[0.08] bg-[#0D1117]"
                    : "border-white/[0.1] bg-[#0D1117]/80"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={barber.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#EEE9E0] truncate">{barber.name}</p>
                    <p className="text-xs text-[#6B7A94]">{barber.position}</p>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border shrink-0",
                      STATUS_STYLES[info.status]
                    )}
                  >
                    {info.label}
                  </span>
                </div>

                {info.detail ? (
                  <p className="text-xs text-[#6B7A94] mb-3 flex items-center gap-1.5">
                    <Scissors className="w-3 h-3 shrink-0" />
                    {info.detail}
                  </p>
                ) : null}

                {info.rules.length > 0 && info.status === "partial" ? (
                  <div className="space-y-1.5 mb-3">
                    {info.rules.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between text-xs bg-white/[0.03] rounded-lg px-2 py-1.5"
                      >
                        <span className="text-[#8A9BB0] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {r.startTime}–{r.endTime}
                        </span>
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => onDeleteRule(r.id)}
                        >
                          Kaldır
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {canToggle && info.status === "available" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => {
                          if (
                            window.confirm(
                              `${barber.name} — ${dayLabel} tüm gün müsait değil olarak işaretlenecek. Emin misiniz?`
                            )
                          ) {
                            onCloseBarberDay(barber.id, reason);
                          }
                        }}
                      >
                        Günü Kapat
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={loading}
                        onClick={() => setExpandedBarber(isExpanded ? null : barber.id)}
                      >
                        Saat Kapat
                      </Button>
                    </>
                  )}
                  {canToggle && (info.status === "closed" || info.status === "partial") && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      className="text-green-400 border-green-500/30"
                      onClick={() => {
                        if (
                          window.confirm(`${barber.name} — ${dayLabel} tekrar müsait yapılacak. Emin misiniz?`)
                        ) {
                          onOpenBarberDay(barber.id);
                        }
                      }}
                    >
                      Müsait Yap
                    </Button>
                  )}
                  {info.status === "vacation" && (
                    <p className="text-[10px] text-[#4A5568]">Berberler sayfasından tatili kaldırın.</p>
                  )}
                </div>

                {isExpanded && canToggle && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2">
                    <Input label="Başlangıç" type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} />
                    <Input label="Bitiş" type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} />
                    <div className="col-span-2">
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={loading || blockStart >= blockEnd}
                        onClick={() => {
                          onBlockHours(barber.id, blockStart, blockEnd, reason);
                          setExpandedBarber(null);
                        }}
                      >
                        {blockStart}–{blockEnd} Kapat
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeBarbers.length > 0 && !salon.closed && (
        <p className="text-xs text-[#4A5568] mt-4 text-center">
          {activeBarbers.length} berber aktif · Müşteriler randevuda sadece müsait berberleri görebilir
        </p>
      )}
    </Card>
  );
}
