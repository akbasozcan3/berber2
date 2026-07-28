"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Tabs from "@/components/admin/ui/Tabs";
import AvailabilityManager from "@/components/admin/AvailabilityManager";
import { adminApi, type AdminAppointment, type AvailabilityBlock } from "@/lib/api/admin";
import { statusConfig } from "@/lib/admin/utils";

export default function CalendarPage() {
  const [view, setView] = useState("daily");
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const load = useCallback(async () => {
    const [apts, avail] = await Promise.all([
      adminApi.getAppointments(),
      adminApi.getAvailability(selectedDate),
    ]);
    setAppointments(apts);
    setBlocks(avail);
  }, [selectedDate]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const dateStr = selectedDate;
  const dayApts = appointments.filter((a) => a.date === dateStr);

  const viewTabs = [
    { id: "daily", label: "Günlük" },
    { id: "availability", label: "Kapalı Saatler" },
  ];

  return (
    <div>
      <PageHeader
        title="Takvim"
        description="Randevuları ve müsaitlik durumunu yönetin"
        actions={
          <div className="flex items-center gap-2">
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#0D1117] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-[#F8F8F8]" />
          </div>
        }
      />

      <div className="mb-6"><Tabs tabs={viewTabs} activeTab={view} onChange={setView} /></div>

      {view === "availability" && (
        <AvailabilityManager date={selectedDate} blocks={blocks} onUpdate={load} />
      )}

      {view === "daily" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2" padding="none">
            <div className="p-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-[#F8F8F8]">
                {(() => {
                  const [y, m, d] = selectedDate.split("-").map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
                })()}
              </h2>
              <p className="text-sm text-[#71717A]">{dayApts.length} randevu</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {dayApts.length === 0 ? (
                <p className="p-6 text-sm text-[#71717A]">Bu gün randevu yok.</p>
              ) : (
                dayApts.sort((a, b) => a.time.localeCompare(b.time)).map((apt) => {
                  const config = statusConfig[apt.status as keyof typeof statusConfig] || statusConfig.pending;
                  return (
                    <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
                      <span className="text-sm font-semibold text-[#C8703A] w-14">{apt.time}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#F8F8F8]">{apt.customerName}</p>
                        <p className="text-xs text-[#71717A]">{apt.serviceName} · {apt.barberName}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ color: config.color, backgroundColor: config.bg }}>{config.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
          <AvailabilityManager date={selectedDate} blocks={blocks} onUpdate={load} />
        </div>
      )}
    </div>
  );
}
