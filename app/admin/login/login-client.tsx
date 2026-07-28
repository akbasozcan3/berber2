"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api/client";
import Input from "@/components/admin/ui/Input";
import Button from "@/components/admin/ui/Button";
import { businessInitials } from "@/lib/utils/brand";

export default function AdminLoginPage({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.login(email, password);
      // Hard redirect — session cache'i temizler, AdminShell yeniden mount olur
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080D15] p-4 text-[#EEE9E0]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(200,112,58,0.10),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8703A]/50 to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[8px] bg-[#C8703A] shadow-[0_18px_45px_rgba(200,112,58,0.22)]">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={businessName} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-[#0A0F18] font-bold text-xl">{businessInitials(businessName)}</span>
            )}
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#C8703A]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Güvenli Yönetim
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F8F8F8]">Admin Girişi</h1>
          <p className="mt-2 text-sm text-[#8A9BB0]">{businessName} Yönetim Paneli</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[8px] border border-white/[0.08] bg-[#141E2E]/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur"
        >
          <Input
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Giriş yapılıyor...
              </>
            ) : (
              "Giriş Yap"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
