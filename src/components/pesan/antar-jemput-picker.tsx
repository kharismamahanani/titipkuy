"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn, formatRupiah } from "@/lib/utils";
import type { AntarJemputOption } from "@/types/antar-jemput";

interface AntarJemputPickerProps {
  value: AntarJemputOption | null;
  onChange: (option: AntarJemputOption | null) => void;
}

export function AntarJemputPicker({ value, onChange }: AntarJemputPickerProps) {
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

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-foreground/60">
          <Loader2 className="animate-spin" size={16} />
          Memuat opsi antar-jemput...
        </p>
      ) : (
        <div className="space-y-2">
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

          {options.map((option) => {
            const isSelected = value?.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                  isSelected
                    ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                    : "border-card-border text-foreground/80 hover:bg-primary/10"
                )}
              >
                <span>{option.label}</span>
                <span className="font-semibold">+{formatRupiah(option.harga)}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
        💡 Kirim mandiri via Grab/Lalamove? Hubungi admin via WhatsApp setelah
        submit untuk koordinasi.
      </div>

      <p className="text-xs text-foreground/50">
        Penjemputan armada TitipKuy! hanya pada jam operasional. Hari Minggu &
        tanggal merah: armada tidak tersedia, gunakan opsi kirim mandiri.
      </p>
    </div>
  );
}
