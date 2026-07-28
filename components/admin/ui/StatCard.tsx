"use client";

import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import Card from "./Card";
import { cn } from "@/lib/admin/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export default function StatCard({
  title,
  value,
  prefix,
  suffix,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card hover className={cn("group", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm text-[#6B7A94] font-medium">{title}</p>
            <p className="text-3xl font-semibold text-[#EEE9E0] tracking-tight">
              <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
            </p>
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-green-400" : "text-red-400"
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}% geçen haftaya göre
              </p>
            )}
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#C8703A]/10 border border-[#C8703A]/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Icon className="w-5 h-5 text-[#C8703A]" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
