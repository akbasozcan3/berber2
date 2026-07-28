"use client";

import { Menu } from "lucide-react";
import NotificationBell from "../NotificationBell";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { useAdminSession } from "@/lib/context/AdminSessionContext";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAdminSession();
  const displayName = user?.name ?? "Admin";

  return (
    <header className="sticky top-0 z-20 bg-[#0A0F18]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-white/[0.06]">
            <Avatar name={displayName} size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-[#EEE9E0]">{displayName}</p>
              <p className="text-xs text-[#6B7A94]">Yönetici</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
