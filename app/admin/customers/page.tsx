"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, CalendarCheck, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Avatar from "@/components/admin/ui/Avatar";
import SearchInput from "@/components/admin/ui/SearchInput";
import Badge from "@/components/admin/ui/Badge";
import Button from "@/components/admin/ui/Button";
import { adminApi, type AdminCustomer } from "@/lib/api/admin";
import { formatCurrency, formatDate } from "@/lib/admin/utils";
import { cn } from "@/lib/admin/cn";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(() => {
    adminApi.getCustomers().then(setCustomers);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const showToast = (text: string, ok: boolean) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const deleteCustomer = async (customer: AdminCustomer) => {
    const activeCount = customer.activeAppointments ?? 0;
    const confirmed = window.confirm(
      `${customer.name} müşterisi ve ${activeCount > 0 ? `${activeCount} aktif randevusu` : "tüm randevu kayıtları"} kalıcı olarak silinecek. Emin misiniz?`
    );
    if (!confirmed) return;

    setDeletingId(customer.id);
    try {
      const result = await adminApi.deleteCustomer(customer.id);
      showToast(
        result.deletedAppointments > 0
          ? `${customer.name} silindi. ${result.deletedAppointments} randevu kaldırıldı.`
          : `${customer.name} silindi.`,
        true
      );
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Silinemedi.", false);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = customers.filter((customer) => {
    const q = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(q) ||
      customer.phone.includes(search) ||
      (customer.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Müşteriler"
        description={`${customers.length} aktif müşteri — yalnızca randevusu olan kayıtlar`}
        actions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="İsim, telefon veya e-posta..."
            className="w-72"
          />
        }
      />

      {toast && (
        <div
          className={cn(
            "mb-4 p-3 rounded-xl text-sm border",
            toast.ok
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          {toast.text}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-[#A1A1AA] text-sm">
            {search
              ? "Aramanızla eşleşen müşteri bulunamadı."
              : "Aktif randevusu olan müşteri bulunmuyor. Yeni randevu alındığında burada görünür."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((customer, i) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar name={customer.name} size="lg" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#F8F8F8] truncate">{customer.name}</h3>
                      <p className="text-sm text-[#71717A]">{customer.phone}</p>
                      {customer.email ? (
                        <p className="text-xs text-[#71717A] truncate flex items-center gap-1 mt-1">
                          <Mail size={11} className="shrink-0" />
                          {customer.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {(customer.activeAppointments ?? 0) > 0 ? (
                      <Badge status="pending" />
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCustomer(customer)}
                      disabled={deletingId === customer.id}
                      title="Müşteriyi sil"
                    >
                      <Trash2 className="w-4 h-4 text-[#71717A] hover:text-red-400" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="p-3 bg-[#0D1117] rounded-2xl border border-white/[0.06]">
                    <p className="text-xs text-[#71717A]">Tamamlanan</p>
                    <p className="text-lg font-semibold text-[#F8F8F8]">{customer.visitCount}</p>
                  </div>
                  <div className="p-3 bg-[#0D1117] rounded-2xl border border-white/[0.06]">
                    <p className="text-xs text-[#71717A]">Aktif Randevu</p>
                    <p className="text-lg font-semibold text-[#C8703A]">
                      {customer.activeAppointments ?? 0}
                    </p>
                  </div>
                  <div className="p-3 bg-[#0D1117] rounded-2xl border border-white/[0.06]">
                    <p className="text-xs text-[#71717A]">Harcama</p>
                    <p className="text-lg font-semibold text-[#C8703A]">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>
                </div>

                {customer.lastVisit ? (
                  <p className="text-xs text-[#71717A] mt-3 flex items-center gap-1.5">
                    <CalendarCheck size={12} />
                    Son ziyaret: {formatDate(customer.lastVisit)}
                  </p>
                ) : null}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
