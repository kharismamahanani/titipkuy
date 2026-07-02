"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import type { PengambilanLaba } from "@/types/rekap";

interface WithdrawalHistoryProps {
  data: PengambilanLaba[];
  onDelete: (id: string) => void;
}

export function WithdrawalHistory({ data, onDelete }: WithdrawalHistoryProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-foreground/50">
        Belum ada pengambilan yang dicatat. Simpan lewat kalkulator di atas.
      </p>
    );
  }

  const sorted = [...data].sort((a, b) => b.bulan.localeCompare(a.bulan));

  return (
    <div className="glass-card overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[500px] text-left text-sm">
        <thead className="border-b border-card-border text-foreground/60">
          <tr>
            <th className="px-4 py-3 font-medium">Bulan</th>
            <th className="px-4 py-3 font-medium">Jumlah Diambil</th>
            <th className="px-4 py-3 font-medium">Dicatat Pada</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item.id} className="border-b border-card-border last:border-0">
              <td className="px-4 py-3">
                {format(new Date(`${item.bulan}-01`), "MMMM yyyy", { locale: localeId })}
              </td>
              <td className="px-4 py-3 font-medium">{formatRupiah(item.jumlah)}</td>
              <td className="px-4 py-3 text-foreground/60">
                {format(new Date(item.dicatatPada), "d MMM yyyy, HH:mm", { locale: localeId })}
              </td>
              <td className="px-4 py-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
