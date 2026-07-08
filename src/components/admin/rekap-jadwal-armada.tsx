"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { tkSelectTriggerClass } from "@/lib/form-style";
import { SLOT_SESI } from "@/lib/constants";

type RangeFilter = "hari" | "minggu" | "semua";

interface RekapRow {
  id: string;
  jenisLayanan: "jemput" | "antar";
  tanggal: string;
  sesiWaktu: string | null;
  statusTransaksi: "AKTIF" | "SELESAI" | "DIBATALKAN";
  pelanggan: { nama: string };
  armada: { nama: string } | null;
  antarJemputOption: { radiusLabel: string; label: string } | null;
}

const JENIS_LAYANAN_LABEL: Record<RekapRow["jenisLayanan"], string> = {
  jemput: "🛵 Jemput",
  antar: "📦 Antar",
};

export function RekapJadwalArmada() {
  const [range, setRange] = useState<RangeFilter>("hari");
  const [rows, setRows] = useState<RekapRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/rekap-jadwal?range=${range}`)
      .then((res) => res.json())
      .then((result: { data: RekapRow[] }) => setRows(result.data ?? []))
      .catch(() => setRows([]))
      .finally(() => setIsLoading(false));
  }, [range]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Select value={range} onValueChange={(value) => value && setRange(value as RangeFilter)}>
            <SelectTrigger className={tkSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hari">Hari Ini</SelectItem>
              <SelectItem value="minggu">Minggu Ini</SelectItem>
              <SelectItem value="semua">Semua</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-tk-muted">
          <Loader2 className="animate-spin" size={16} /> Memuat rekap...
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-tk-light">Belum ada jadwal antar-jemput di rentang ini.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-tk-charcoal bg-tk-cream-alt text-xs font-bold uppercase text-tk-muted">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jenis Layanan</th>
                <th className="px-4 py-3">Sesi</th>
                <th className="px-4 py-3">Armada</th>
                <th className="px-4 py-3">Nama Customer</th>
                <th className="px-4 py-3">Tujuan</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6CEC4]">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-semibold text-tk-charcoal">
                    {format(new Date(r.tanggal), "d MMM yyyy", { locale: localeId })}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 font-bold",
                      r.jenisLayanan === "jemput" ? "text-tk-orange-dark" : "text-tk-sage-dark"
                    )}
                  >
                    {JENIS_LAYANAN_LABEL[r.jenisLayanan]}
                  </td>
                  <td className="px-4 py-3 text-tk-muted">
                    {r.sesiWaktu
                      ? SLOT_SESI[r.sesiWaktu as keyof typeof SLOT_SESI]?.label ?? r.sesiWaktu
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-tk-muted">{r.armada?.nama ?? "-"}</td>
                  <td className="px-4 py-3 font-semibold text-tk-charcoal">
                    {r.pelanggan.nama}
                  </td>
                  <td className="px-4 py-3 text-tk-muted">
                    {r.antarJemputOption?.radiusLabel ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.statusTransaksi}>{r.statusTransaksi}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
