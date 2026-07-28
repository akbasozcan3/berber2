import { cn } from "@/lib/admin/cn";
import type { AppointmentStatus } from "@/lib/admin/types";
import { statusConfig } from "@/lib/admin/utils";

interface BadgeProps {
  status?: AppointmentStatus;
  label?: string;
  variant?: "default" | "gold" | "outline";
  className?: string;
}

export default function Badge({ status, label, variant = "default", className }: BadgeProps) {
  if (status) {
    const config = statusConfig[status];
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg",
          className
        )}
        style={{
          color: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
        }}
      >
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg",
        {
          "bg-white/[0.06] text-[#8A9BB0]": variant === "default",
          "bg-[#C8703A]/10 text-[#C8703A] border border-[#C8703A]/20": variant === "gold",
          "border border-white/[0.06] text-[#8A9BB0]": variant === "outline",
        },
        className
      )}
    >
      {label}
    </span>
  );
}
