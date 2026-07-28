"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi, type Notification } from "@/lib/api/admin";
import Button from "@/components/admin/ui/Button";
import { cn } from "@/lib/admin/cn";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getNotifications();
      setNotifications(data.items);
      setUnread(data.unread);
    } catch { /* not logged in */ }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);

    // EventSource cookie göndermez — withCredentials olmadan auth çalışmaz
    // Bu nedenle polling kullanıyoruz (her 30sn)
    const pollInterval = setInterval(() => {
      void load();
    }, 30000);

    // SSE bağlantısını dene, başarısız olursa polling devam eder
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/v1/admin/events");
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "notification") {
            void load();
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              new Notification(data.notification.title, { body: data.notification.message });
            }
          }
        } catch { /* heartbeat veya parse hatası */ }
      };
      es.onerror = () => {
        es?.close();
        es = null;
      };
    } catch { /* SSE desteklenmiyor */ }

    return () => {
      clearInterval(pollInterval);
      es?.close();
    };
  }, [load]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const markRead = async (id: number) => {
    await adminApi.markNotificationRead(id);
    load();
  };

  const markAllRead = async () => {
    await adminApi.markAllRead();
    load();
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)}>
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#C8703A] text-[#0A0F18] text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 bg-[#141E2E] border border-white/[0.06] rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-[#EEE9E0]">Bildirimler</h3>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#C8703A] hover:underline">
                    Tümünü oku
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-sm text-[#6B7A94] text-center">Bildirim yok</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "p-4 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer",
                        !n.read && "bg-[#C8703A]/5"
                      )}
                      onClick={() => !n.read && markRead(n.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-[#EEE9E0]">{n.title}</p>
                          <p className="text-xs text-[#6B7A94] mt-1">{n.message}</p>
                          <p className="text-[10px] text-[#4A5568] mt-1">
                            {new Date(n.createdAt).toLocaleString("tr-TR")}
                          </p>
                        </div>
                        {n.read ? (
                          <Check className="w-3.5 h-3.5 text-[#6B7A94] flex-shrink-0" />
                        ) : (
                          <span className="w-2 h-2 bg-[#C8703A] rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
