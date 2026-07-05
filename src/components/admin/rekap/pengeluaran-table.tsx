"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { tkDangerButtonClass } from "@/lib/form-style";
import { labelKategoriPengeluaran } from "@/lib/pengeluaran";
import type { Pengeluaran } from "@/types/rekap";

interface PengeluaranTableProps {
  data: Pengeluaran[];
  onDelete: (id: string) => void;
}

export function PengeluaranTable({ data, onDelete }: PengeluaranTableProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-tk-light">Belum ada pengeluaran dicatat bulan ini.</p>
    );
  }

  const sorted = [...data].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const total = data.reduce((sum, p) => sum + p.jumlah, 0);

  return (
    <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal">
      <table className="w-full min-w-[600px] border-collapse text-left text-sm">
        <thead className="bg-tk-charcoal text-tk-cream">
          <tr>
            <th className="px-4 py-3 font-bold">Tanggal</th>
            <th className="px-4 py-3 font-bold">Kategori</th>
            <th className="px-4 py-3 font-bold">Deskripsi</th>
            <th className="px-4 py-3 font-bold">Jumlah</th>
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
                {format(new Date(item.tanggal), "d MMM yyyy", { locale: localeId })}
              </td>
              <td className="px-4 py-3 text-tk-charcoal">
                {labelKategoriPengeluaran(item.kategori)}
              </td>
              <td className="px-4 py-3 text-tk-muted">{item.deskripsi}</td>
              <td className="px-4 py-3 font-bold text-tk-charcoal">{formatRupiah(item.jumlah)}</td>
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
        <tfoot>
          <tr className="border-t-2 border-tk-charcoal bg-tk-cream-alt">
            <td className="px-4 py-3 font-extrabold text-tk-charcoal" colSpan={3}>
              Total Pengeluaran Bulan Ini
            </td>
            <td className="px-4 py-3 font-extrabold text-tk-charcoal" colSpan={2}>
              {formatRupiah(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
