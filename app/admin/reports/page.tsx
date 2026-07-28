"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import { adminApi, type ReportsData } from "@/lib/api/admin";
import { formatCurrency } from "@/lib/admin/utils";

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);

  useEffect(() => { adminApi.getReports().then(setData); }, []);

  if (!data) return <div className="flex items-center justify-center h-64 text-[#71717A]">Yükleniyor...</div>;

  return (
    <div>
      <PageHeader title="Raporlar" description="Gerçek işletme verileri" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Toplam Müşteri", value: data.totalCustomers },
          { label: "Toplam Randevu", value: data.totalAppointments },
          { label: "Toplam Gelir", value: formatCurrency(data.totalRevenue) },
        ].map((s) => (
          <Card key={s.label}><p className="text-sm text-[#71717A]">{s.label}</p><p className="text-2xl font-semibold text-[#F8F8F8] mt-1">{s.value}</p></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Gelir Trendi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#52525B" fontSize={12} />
                <YAxis stroke="#52525B" fontSize={12} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }} />
                <Bar dataKey="revenue" fill="#C8703A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Popüler Hizmetler</h3>
          <div className="space-y-3">
            {data.popularServices.map((s) => (
              <div key={s.name} className="flex justify-between items-center">
                <span className="text-sm text-[#A1A1AA]">{s.name}</span>
                <span className="text-sm font-medium text-[#F8F8F8]">{s.count} randevu</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <h3 className="text-sm font-semibold text-[#F8F8F8] mb-4">Berber Performansı</h3>
          <div className="space-y-3">
            {data.barberStats.map((b, i) => (
              <div key={b.name} className="flex items-center gap-4">
                <span className="text-[#71717A] w-5">{i + 1}</span>
                <span className="flex-1 text-[#F8F8F8]">{b.name}</span>
                <span className="text-sm text-[#71717A]">{b.appointments} randevu</span>
                <span className="text-sm font-semibold text-[#C8703A]">{formatCurrency(b.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
