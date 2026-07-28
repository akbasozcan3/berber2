"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/admin/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[#8A9BB0]">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[100px] bg-[#0D1117] border border-white/[0.06] rounded-2xl text-[#EEE9E0] text-sm px-4 py-3 placeholder:text-[#4A5568] resize-none transition-all duration-200",
            "focus:outline-none focus:border-[#C8703A]/40 focus:ring-1 focus:ring-[#C8703A]/20",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
