"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={14} />
        Sebelumnya
      </Button>
      <p className="text-sm text-foreground/60">
        Halaman {page} dari {totalPages}
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Berikutnya
        <ChevronRight size={14} />
      </Button>
    </div>
  );
}
