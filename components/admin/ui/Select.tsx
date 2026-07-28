"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/admin/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[#8A9BB0]">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full h-11 appearance-none bg-[#0D1117] border border-white/[0.06] rounded-2xl text-[#EEE9E0] text-sm px-4 pr-10 transition-all duration-200",
              "focus:outline-none focus:border-[#C8703A]/40 focus:ring-1 focus:ring-[#C8703A]/20",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A94] pointer-events-none" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
