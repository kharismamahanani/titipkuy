"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { tkLabelClass } from "@/lib/form-style";
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
    <div className="space-y-4 rounded-lg border-2 border-tk-charcoal bg-white p-5">
      <Label className={tkLabelClass}>🛵 Mau barangmu dijemput / diantar? (Opsional)</Label>

      <div className="rounded-lg border-2 border-tk-charcoal bg-tk-cream-alt p-3 text-xs text-tk-charcoal">
        <p className="font-bold">⏰ Jam Operasional Hub Suhat</p>
        <p className="mt-1">{JAM_OPERASIONAL_HUB_SUHAT.hari}</p>
        <p>{JAM_OPERASIONAL_HUB_SUHAT.libur}</p>
      </div>

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-tk-muted">
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
                "w-full rounded-lg border-2 border-tk-charcoal px-4 py-2.5 text-left text-sm transition-colors",
                value === null
                  ? "bg-tk-charcoal text-tk-cream"
                  : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
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
                  "w-full rounded-lg border-2 border-tk-charcoal px-4 py-2.5 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-tk-charcoal text-tk-cream"
                    : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
                )}
              >
                <span className="flex items-center justify-between">
                  <span>{option.label}</span>
                  <span className="font-bold">+{formatRupiah(option.harga)}</span>
                </span>
                {option.kapasitasLabel && (
                  <span
                    className={cn(
                      "mt-1 block text-xs",
                      isSelected ? "text-tk-cream/80" : "text-tk-muted"
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
        <div className="rounded-lg border-2 border-tk-orange bg-tk-orange/10 p-3 text-xs text-tk-charcoal">
          📌 Jam drop-off: {JAM_DROP_OFF_MANDIRI} (Senin–Sabtu). Setelah submit, kamu
          akan menerima Kode Unik via WhatsApp. Tulis kode itu di kardus/koper
          sebelum dikirim.
        </div>
      ) : (
        <p className="text-xs text-tk-light">
          Penjemputan armada TitipKuy! hanya pada jam operasional. Hari Minggu &
          tanggal merah: armada tidak tersedia, gunakan opsi kirim mandiri.
        </p>
      )}
    </div>
  );
}
