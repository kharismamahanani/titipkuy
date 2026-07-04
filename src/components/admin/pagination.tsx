"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { TkButton } from "@/components/ui/tk-button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <TkButton
        type="button"
        size="sm"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={14} className="mr-1" />
        Sebelumnya
      </TkButton>
      <p className="text-sm text-tk-muted">
        Halaman {page} dari {totalPages}
      </p>
      <TkButton
        type="button"
        size="sm"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Berikutnya
        <ChevronRight size={14} className="ml-1" />
      </TkButton>
    </div>
  );
}
