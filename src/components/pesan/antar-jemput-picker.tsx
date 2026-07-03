"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn, formatRupiah } from "@/lib/utils";
import { JAM_DROP_OFF_MANDIRI, JAM_OPERASIONAL_HUB_SUHAT } from "@/lib/constants";
import type { AntarJemputOption } from "@/types/antar-jemput";

interface AntarJemputPickerProps {
  value: AntarJemputOption | null;
  onChange: (option: AntarJemputOption | null) => void;
  hideMandiriOption?: boolean;
}

export function AntarJemputPicker({ value, onChange, hideMandiriOption }: AntarJemputPickerProps) {
  const [options, setOptions] = useState<AntarJemputOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/antar-jemput")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AntarJemputOption[]) => setOptions(data))
      .catch(() => setOptions([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="glass-card space-y-4 rounded-2xl p-5">
      <div>
        <Label>🛵 Mau barangmu dijemput / diantar? (Opsional)</Label>
      </div>

      <div className="rounded-xl border border-card-border bg-card-dark/60 p-3 text-xs text-foreground/70">
        <p className="font-semibold text-foreground/80">⏰ Jam Operasional Hub Suhat</p>
        <p className="mt-1">{JAM_OPERASIONAL_HUB_SUHAT.hari}</p>
        <p>{JAM_OPERASIONAL_HUB_SUHAT.libur}</p>
      </div>

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-foreground/60">
          <Loader2 className="animate-spin" size={16} />
          Memuat opsi antar-jemput...
        </p>
      ) : (
        <div className="space-y-2">
          {!hideMandiriOption && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className={cn(
                "w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                value === null
                  ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                  : "border-card-border text-foreground/80 hover:bg-primary/10"
              )}
            >
              Tidak perlu, saya antar sendiri / kirim via Grab
            </button>
          )}

          {options.map((option) => {
            const isSelected = value?.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option)}
                className={cn(
                  "w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                  isSelected
                    ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                    : "border-card-border text-foreground/80 hover:bg-primary/10"
                )}
              >
                <span className="flex items-center justify-between">
                  <span>{option.label}</span>
                  <span className="font-semibold">+{formatRupiah(option.harga)}</span>
                </span>
                {option.kapasitasLabel && (
                  <span
                    className={cn(
                      "mt-1 block text-xs",
                      isSelected ? "text-white/80" : "text-foreground/50"
                    )}
                  >
                    {option.kapasitasLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {value === null && !hideMandiriOption ? (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
          📌 Jam drop-off: {JAM_DROP_OFF_MANDIRI} (Senin–Sabtu). Setelah submit, kamu
          akan menerima Kode Unik via WhatsApp. Tulis kode itu di kardus/koper
          sebelum dikirim.
        </div>
      ) : (
        <p className="text-xs text-foreground/50">
          Penjemputan armada TitipKuy! hanya pada jam operasional. Hari Minggu &
          tanggal merah: armada tidak tersedia, gunakan opsi kirim mandiri.
        </p>
      )}
    </div>
  );
}
