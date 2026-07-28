"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import StatCard from "@/components/admin/ui/StatCard";
import Card from "@/components/admin/ui/Card";
import Badge from "@/components/admin/ui/Badge";
import PageHeader from "@/components/admin/ui/PageHeader";
import Avatar from "@/components/admin/ui/Avatar";
import { formatCurrency, formatTime } from "@/lib/admin/utils";
import { adminApi, type AdminAppointment } from "@/lib/api/admin";
import { normalizeDashboardStats } from "@/lib/api/dashboard-stats";

interface DashboardData {
  todayAppointments: number;
  waitingCustomers: number;
  completedToday: number;
  revenueToday: number;
  revenueMonth: number;
}

const EMPTY_STATS: DashboardData = {
  todayAppointments: 0,
  waitingCustomers: 0,
  completedToday: 0,
  revenueToday: 0,
  revenueMonth: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [todayApts, setTodayApts] = useState<AdminAppointment[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    Promise.all([adminApi.getDashboard(), adminApi.getAppointments()])
      .then(([dashboard, appointments]) => {
        setStats(normalizeDashboardStats(dashboard));
        setTodayApts(appointments.filter((a) => a.date === today).slice(0, 8));
      })
      .catch((err: Error) => {
        setStats(EMPTY_STATS);
        setTodayApts([]);
        const msg = err.message || "Veriler yüklenemedi";
        setLoadError(
          msg === "Unauthorized"
            ? "Oturum süresi dolmuş olabilir. Çıkış yapıp tekrar giriş yapın."
            : msg
        );
      });
  }, []);

  if (!stats) {
    return <div className="flex items-center justify-center h-64 text-[#71717A]">Yükleniyor...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Özet"
        description={`Hoş geldiniz! Bugün ${new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
      />

      {loadError && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {loadError}{" "}
          <a
            href="/api/v1/health"
            target="_blank"
            rel="noreferrer"
            className="underline text-amber-100"
          >
            Veritabanı durumunu kontrol et
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <StatCard title="Bugünkü Randevular" value={stats.todayAppointments} icon={Calendar} />
        <StatCard title="Bekleyen Müşteriler" value={stats.waitingCustomers} icon={Clock} />
        <StatCard title="Tamamlanan" value={stats.completedToday} icon={CheckCircle} />
        <StatCard title="Bugünkü Gelir" value={stats.revenueToday} prefix="₺" icon={DollarSign} />
        <StatCard title="Aylık Gelir" value={stats.revenueMonth} prefix="₺" icon={TrendingUp} />
      </div>

      <Card padding="none" className="xl:col-span-2">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-[#F8F8F8]">Bugünkü Randevular</h2>
          <p className="text-sm text-[#71717A] mt-1">{todayApts.length} randevu</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {todayApts.length === 0 ? (
            <p className="p-6 text-sm text-[#71717A]">Bugün randevu yok.</p>
          ) : (
            todayApts.map((apt, i) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 hover:bg-white/[0.02]"
              >
                <div className="w-14 text-center flex-shrink-0">
                  <p className="text-sm font-semibold text-[#C8703A]">{formatTime(apt.time)}</p>
                </div>
                <Avatar name={apt.customerName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F8F8F8] truncate">{apt.customerName}</p>
                  <p className="text-xs text-[#71717A]">{apt.serviceName} · {apt.barberName}</p>
                </div>
                <Badge status={apt.status as "confirmed" | "pending" | "completed" | "cancelled"} />
                <p className="text-sm font-medium text-[#F8F8F8] hidden sm:block">{formatCurrency(apt.price)}</p>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
