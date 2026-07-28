"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import { adminApi, type ContactMessage } from "@/lib/api/admin";
import { formatDate } from "@/lib/admin/utils";
import { cn } from "@/lib/admin/cn";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const load = () => adminApi.getMessages().then(setMessages);
  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await adminApi.markMessageRead(id);
    load();
  };

  const unread = messages.filter((m) => !m.read);

  return (
    <div>
      <PageHeader
        title="İletişim Mesajları"
        description={`${messages.length} mesaj · ${unread.length} okunmamış`}
      />
      <div className="space-y-4">
        {messages.length === 0 && (
          <Card>
            <p className="text-[#71717A] text-sm text-center py-8">Henüz mesaj yok.</p>
          </Card>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={cn(!msg.read && "border-[#C8703A]/20")}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-[#F8F8F8]">{msg.name}</h3>
                    {!msg.read && <Badge label="Yeni" variant="gold" />}
                    <span className="text-xs text-[#71717A]">{formatDate(msg.createdAt)}</span>
                  </div>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-sm text-[#C8703A] hover:underline flex items-center gap-1.5 mb-3"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {msg.email}
                  </a>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
                {!msg.read && (
                  <Button variant="outline" size="sm" onClick={() => markRead(msg.id)}>
                    <Check className="w-4 h-4 mr-1.5" />
                    Okundu
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
