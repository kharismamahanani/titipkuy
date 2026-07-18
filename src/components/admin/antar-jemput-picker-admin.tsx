"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { tkLabelClass } from "@/lib/form-style";
import { cn, formatRupiah } from "@/lib/utils";
import { LokasiPinMap } from "@/components/admin/lokasi-pin-map";
import type { KategoriJarak } from "@/hooks/use-deteksi-lokasi";
import {
  hargaAntarJemput,
  labelLayananAntarJemput,
  type AntarJemputOption,
  type AntarJemputSelection,
  type LayananAntarJemput,
} from "@/types/antar-jemput";

type RadiusLabel = "<3km" | "3-6km";

const LAYANAN_LIST: { value: LayananAntarJemput; icon: string }[] = [
  { value: "jemput-saja", icon: "🛵" },
  { value: "antar-saja", icon: "📦" },
  { value: "jemput-dan-antar", icon: "🔄" },
];

interface AntarJemputPickerAdminProps {
  value: AntarJemputSelection | null;
  onChange: (selection: AntarJemputSelection | null) => void;
  onLokasiChange?: (lat: number, lng: number) => void;
}

// Versi admin dari AntarJemputPicker (src/components/pesan/antar-jemput-picker.tsx)
// untuk form order manual — bedanya sumber jarak dari LokasiPinMap (admin
// menandai lokasi pelanggan di peta) alih-alih GPS device pelanggan sendiri.
export function AntarJemputPickerAdmin({ value, onChange, onLokasiChange }: AntarJemputPickerAdminProps) {
  const [options, setOptions] = useState<AntarJemputOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kategori, setKategori] = useState<KategoriJarak | null>(null);

  useEffect(() => {
    fetch("/api/antar-jemput")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AntarJemputOption[]) => setOptions(data))
      .catch(() => setOptions([]))
      .finally(() => setIsLoading(false));
  }, []);

  function handleJarakChange(_jarak: number, kategoriBaru: KategoriJarak, lat: number, lng: number) {
    setKategori(kategoriBaru);
    onLokasiChange?.(lat, lng);
  }

  const effectiveRadius: RadiusLabel | null =
    kategori === "dekat" ? "<3km" : kategori === "sedang" ? "3-6km" : null;

  const visibleOptions = options.filter((o) => o.radiusLabel === effectiveRadius);
  const selectedOption = value?.option ?? null;

  return (
    <div className="space-y-4 rounded-lg border-2 border-tk-charcoal bg-white p-5">
      <Label className={tkLabelClass}>📍 Tandai lokasi pelanggan untuk hitung biaya jemput</Label>

      <LokasiPinMap onJarakChange={handleJarakChange} />

      {isLoading && (
        <p className="flex items-center gap-2 text-sm text-tk-muted">
          <Loader2 className="animate-spin" size={16} />
          Memuat opsi antar-jemput...
        </p>
      )}

      {!isLoading && kategori === "jauh" && (
        <div className="rounded-lg border-2 border-[#C0392B] bg-white p-3 text-xs font-semibold text-[#C0392B]">
          ❌ Lokasi di luar radius layanan antar-jemput TitipKuy! (maks. 6 km dari Hub Suhat).
        </div>
      )}

      {!isLoading && effectiveRadius && (
        <div className="space-y-2">
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
            Tidak perlu antar-jemput
          </button>

          {visibleOptions.map((option) => {
            const isSelected = selectedOption?.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ option, layanan: "jemput-saja" })}
                className={cn(
                  "w-full rounded-lg border-2 border-tk-charcoal px-4 py-2.5 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-tk-charcoal text-tk-cream"
                    : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
                )}
              >
                <span className="flex items-center justify-between">
                  <span>{option.label}</span>
                  <span className="font-bold">mulai {formatRupiah(option.hargaJemputSaja)}</span>
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

      {selectedOption && (
        <div className="space-y-2">
          <Label className={tkLabelClass}>Jenis layanan</Label>
          {LAYANAN_LIST.map((layananItem) => {
            const isSelected = value?.option.id === selectedOption.id && value?.layanan === layananItem.value;
            const harga = hargaAntarJemput(selectedOption, layananItem.value);
            return (
              <button
                key={layananItem.value}
                type="button"
                onClick={() => onChange({ option: selectedOption, layanan: layananItem.value })}
                className={cn(
                  "w-full rounded-lg border-2 border-tk-charcoal px-4 py-2.5 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-tk-charcoal text-tk-cream"
                    : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
                )}
              >
                <span className="flex items-center justify-between">
                  <span>
                    {layananItem.icon} {labelLayananAntarJemput(layananItem.value)}
                  </span>
                  <span className="font-bold">+{formatRupiah(harga)}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
