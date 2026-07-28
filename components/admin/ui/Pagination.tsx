"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/admin/cn";
import Button from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-[#6B7A94]">
        Sayfa {currentPage} / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-9 h-9 text-sm font-medium rounded-xl transition-all duration-200",
              currentPage === page
                ? "bg-[#C8703A] text-[#0A0F18]"
                : "text-[#6B7A94] hover:bg-white/[0.04] hover:text-[#EEE9E0]"
            )}
          >
            {page}
          </button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
