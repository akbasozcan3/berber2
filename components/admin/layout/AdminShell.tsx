"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/layout/Sidebar";
import Header from "@/components/admin/layout/Header";
import PageTransition from "@/app/components/ui/PageTransition";
import RouteProgressBar from "@/app/components/ui/RouteProgressBar";
import { cn } from "@/lib/admin/cn";
import { AdminSessionProvider, useAdminSession } from "@/lib/context/AdminSessionContext";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAdminSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-[#080D15]" aria-busy="true" aria-label="Oturum kontrol ediliyor" />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080D15] text-[#EEE9E0]">
      <RouteProgressBar variant="admin" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(200,112,58,0.06),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_26%)]" />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        <Header
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
        />
        <main className="relative z-10 mx-auto w-full max-w-[1600px] p-4 lg:p-8">
          <PageTransition variant="admin">{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminSessionProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminSessionProvider>
  );
}
