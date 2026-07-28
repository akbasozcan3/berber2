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

interface DashboardData {
  todayAppointments: number;
  waitingCustomers: number;
  completedToday: number;
  revenueToday: number;
  revenueMonth: number;
}

interface Appointment {
  id: number;
  customerName: string;
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  status: string;
  price: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [todayApts, setTodayApts] = useState<Appointment[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      fetch("/api/v1/admin/dashboard").then((r) => r.json()),
      fetch("/api/v1/admin/appointments").then((r) => r.json()),
    ]).then(([dashboard, appointments]) => {
      setStats(dashboard);
      setTodayApts(
        (appointments as Appointment[]).filter((a) => a.date === today).slice(0, 8)
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
