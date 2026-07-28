"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/admin/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Ara...",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 bg-[#0D1117] border border-white/[0.06] rounded-2xl text-sm text-[#EEE9E0] placeholder:text-[#4A5568] focus:outline-none focus:border-[#C8703A]/40 focus:ring-1 focus:ring-[#C8703A]/20 transition-all duration-200"
      />
    </div>
  );
}
