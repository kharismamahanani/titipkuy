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
import { tkSelectTriggerClass } from "@/lib/form-style";
import { SLOT_SESI } from "@/lib/constants";

type RangeFilter = "hari" | "minggu" | "semua";

interface RekapBooking {
  id: string;
  nomorRef: string;
  tanggalPenjemputan: string;
  sesiPenjemputan: string | null;
  statusTransaksi: "AKTIF" | "SELESAI" | "DIBATALKAN";
  pelanggan: { nama: string };
  armada: { nama: string } | null;
  antarJemputOption: { radiusLabel: string; label: string } | null;
}

export function RekapJadwalArmada() {
  const [range, setRange] = useState<RangeFilter>("hari");
  const [bookings, setBookings] = useState<RekapBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/rekap-jadwal?range=${range}`)
      .then((res) => res.json())
      .then((result: { data: RekapBooking[] }) => setBookings(result.data ?? []))
      .catch(() => setBookings([]))
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
      ) : bookings.length === 0 ? (
        <p className="text-sm text-tk-light">Belum ada jadwal penjemputan di rentang ini.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-tk-charcoal bg-tk-cream-alt text-xs font-bold uppercase text-tk-muted">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Sesi</th>
                <th className="px-4 py-3">Armada</th>
                <th className="px-4 py-3">Nama Customer</th>
                <th className="px-4 py-3">Tujuan</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6CEC4]">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-semibold text-tk-charcoal">
                    {format(new Date(b.tanggalPenjemputan), "d MMM yyyy", { locale: localeId })}
                  </td>
                  <td className="px-4 py-3 text-tk-muted">
                    {b.sesiPenjemputan
                      ? SLOT_SESI[b.sesiPenjemputan as keyof typeof SLOT_SESI]?.label ??
                        b.sesiPenjemputan
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-tk-muted">{b.armada?.nama ?? "-"}</td>
                  <td className="px-4 py-3 font-semibold text-tk-charcoal">
                    {b.pelanggan.nama}
                  </td>
                  <td className="px-4 py-3 text-tk-muted">
                    {b.antarJemputOption?.radiusLabel ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.statusTransaksi}>{b.statusTransaksi}</StatusBadge>
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
