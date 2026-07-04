"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { tkDangerButtonClass } from "@/lib/form-style";
import type { PengambilanLaba } from "@/types/rekap";

interface WithdrawalHistoryProps {
  data: PengambilanLaba[];
  onDelete: (id: string) => void;
}

export function WithdrawalHistory({ data, onDelete }: WithdrawalHistoryProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-tk-light">
        Belum ada pengambilan yang dicatat. Simpan lewat kalkulator di atas.
      </p>
    );
  }

  const sorted = [...data].sort((a, b) => b.bulan.localeCompare(a.bulan));

  return (
    <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal">
      <table className="w-full min-w-[500px] border-collapse text-left text-sm">
        <thead className="bg-tk-charcoal text-tk-cream">
          <tr>
            <th className="px-4 py-3 font-bold">Bulan</th>
            <th className="px-4 py-3 font-bold">Jumlah Diambil</th>
            <th className="px-4 py-3 font-bold">Dicatat Pada</th>
            <th className="px-4 py-3 font-bold"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, index) => (
            <tr
              key={item.id}
              className={cn(
                "border-b border-[#D6CEC4] transition-colors last:border-0 hover:bg-tk-cream-alt",
                index % 2 === 0 ? "bg-white" : "bg-tk-cream"
              )}
            >
              <td className="px-4 py-3 text-tk-charcoal">
                {format(new Date(`${item.bulan}-01`), "MMMM yyyy", { locale: localeId })}
              </td>
              <td className="px-4 py-3 font-bold text-tk-charcoal">{formatRupiah(item.jumlah)}</td>
              <td className="px-4 py-3 text-tk-muted">
                {format(new Date(item.dicatatPada), "d MMM yyyy, HH:mm", { locale: localeId })}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className={cn(tkDangerButtonClass, "px-3 py-1.5")}
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
