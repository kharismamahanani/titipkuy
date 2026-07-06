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
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { tkInputClass, tkSelectTriggerClass } from "@/lib/form-style";
import { SLOT_SESI } from "@/lib/constants";

type RangeFilter = "minggu" | "bulan" | "tanggal";

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
  const [range, setRange] = useState<RangeFilter>("minggu");
  const [tanggal, setTanggal] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [bookings, setBookings] = useState<RekapBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ range });
    if (range === "tanggal") params.set("tanggal", tanggal);

    fetch(`/api/admin/rekap-jadwal?${params.toString()}`)
      .then((res) => res.json())
      .then((result: { data: RekapBooking[] }) => setBookings(result.data ?? []))
      .catch(() => setBookings([]))
      .finally(() => setIsLoading(false));
  }, [range, tanggal]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Select value={range} onValueChange={(value) => value && setRange(value as RangeFilter)}>
            <SelectTrigger className={tkSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minggu">Minggu ini</SelectItem>
              <SelectItem value="bulan">Bulan ini</SelectItem>
              <SelectItem value="tanggal">Pilih tanggal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {range === "tanggal" && (
          <Input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={cnInput()}
          />
        )}
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

function cnInput() {
  return tkInputClass + " w-44";
}
