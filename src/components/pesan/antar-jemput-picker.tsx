"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { tkLabelClass } from "@/lib/form-style";
import { cn, formatRupiah } from "@/lib/utils";
import { tkButtonVariants } from "@/components/ui/tk-button";
import { JAM_DROP_OFF_MANDIRI, JAM_OPERASIONAL_HUB_SUHAT } from "@/lib/constants";
import { useDeteksiLokasi } from "@/hooks/use-deteksi-lokasi";
import {
  hargaAntarJemput,
  labelLayananAntarJemput,
  type AntarJemputOption,
  type AntarJemputSelection,
  type LayananAntarJemput,
} from "@/types/antar-jemput";
import type { TipeArmada } from "@/lib/armada-rules";

type RadiusLabel = "<3km" | "3-6km";

const LAYANAN_LIST: { value: LayananAntarJemput; icon: string; deskripsi: string }[] = [
  {
    value: "jemput-saja",
    icon: "🛵",
    deskripsi: "Kami jemput barang, kamu ambil sendiri ke Hub saat masa titip selesai",
  },
  {
    value: "antar-saja",
    icon: "📦",
    deskripsi: "Kamu antar barang sendiri ke Hub, kami antarkan balik saat selesai",
  },
  {
    value: "jemput-dan-antar",
    icon: "🔄",
    deskripsi: "Paling praktis — kami jemput di awal, kami antar saat selesai",
  },
];

interface AntarJemputPickerProps {
  value: AntarJemputSelection | null;
  onChange: (selection: AntarJemputSelection | null) => void;
  hideMandiriOption?: boolean;
  allowedArmada?: TipeArmada;
  onOutOfRange?: () => void;
  // Titik lokasi hasil deteksi GPS — disimpan ke transaksi supaya tim
  // jemput/antar armada punya link Google Maps di Rekap Jadwal Perjalanan.
  onLokasiChange?: (lat: number, lng: number) => void;
}

export function AntarJemputPicker({
  value,
  onChange,
  hideMandiriOption,
  allowedArmada = "semua",
  onOutOfRange,
  onLokasiChange,
}: AntarJemputPickerProps) {
  const [options, setOptions] = useState<AntarJemputOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manualRadius, setManualRadius] = useState<RadiusLabel | null>(null);
  const [pendingOption, setPendingOption] = useState<AntarJemputOption | null>(null);
  const { detect, isDetecting, result, error, isPermissionDenied, reset } = useDeteksiLokasi();

  useEffect(() => {
    fetch("/api/antar-jemput")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AntarJemputOption[]) => setOptions(data))
      .catch(() => setOptions([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (result?.kategori === "jauh") onOutOfRange?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.kategori]);

  function handleDetect() {
    setManualRadius(null);
    detect((hasil) => onLokasiChange?.(hasil.lat, hasil.lng));
  }

  function handleDeteksiUlang() {
    reset();
    setManualRadius(null);
  }

  const detectedRadius: RadiusLabel | null =
    result && result.kategori !== "jauh"
      ? result.kategori === "dekat"
        ? "<3km"
        : "3-6km"
      : null;

  const effectiveRadius = detectedRadius ?? manualRadius;

  const visibleOptions = options
    .filter((o) => (allowedArmada === "mobil" ? o.tipe !== "motor" : true))
    .filter((o) => o.radiusLabel === effectiveRadius);

  const selectedOption = value?.option ?? pendingOption;

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-lg border-2 border-tk-charcoal bg-white p-5">
        <Label className={tkLabelClass}>🛵 Mau barangmu dijemput / diantar? (Opsional)</Label>
        <p className="flex items-center gap-2 text-sm text-tk-muted">
          <Loader2 className="animate-spin" size={16} />
          Memuat opsi antar-jemput...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border-2 border-tk-charcoal bg-white p-5">
      <Label className={tkLabelClass}>🛵 Mau barangmu dijemput / diantar? (Opsional)</Label>

      <div className="rounded-lg border-2 border-tk-charcoal bg-tk-cream-alt p-3 text-xs text-tk-charcoal">
        <p className="font-bold">⏰ Jam Operasional Hub Suhat</p>
        <p className="mt-1">{JAM_OPERASIONAL_HUB_SUHAT.hari}</p>
        <p>{JAM_OPERASIONAL_HUB_SUHAT.libur}</p>
      </div>

      {!result && !error && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDetect}
            disabled={isDetecting}
            className={cn(tkButtonVariants({ variant: "secondary", size: "sm" }), "w-full justify-center")}
          >
            {isDetecting ? (
              <Loader2 className="mr-1.5 animate-spin" size={14} />
            ) : (
              <span className="mr-1.5">📍</span>
            )}
            Deteksi Lokasiku
          </button>
          <p className="text-xs text-tk-muted">
            Deteksi lokasi diperlukan untuk menentukan tarif antar-jemput yang sesuai dengan
            jarakmu dari hub.
          </p>
        </div>
      )}

      {result?.kategori === "jauh" && (
        <div className="space-y-2">
          <div className="rounded-lg border-2 border-[#C0392B] bg-white p-3 text-xs font-semibold text-[#C0392B]">
            ❌ Lokasi kamu ({result.jarak.toFixed(1)} km) di luar radius layanan antar-jemput
            TitipKuy! (maks. 6 km dari Hub Suhat). Gunakan opsi Kirim Mandiri via
            Grab/Lalamove.
          </div>
          <button
            type="button"
            onClick={handleDeteksiUlang}
            className="text-xs font-bold text-tk-orange-dark underline underline-offset-4"
          >
            Deteksi ulang
          </button>
        </div>
      )}

      {detectedRadius && (
        <div className="flex items-center justify-between gap-2 rounded-lg border-2 border-tk-sage bg-tk-sage/10 p-3 text-xs font-bold text-tk-charcoal">
          <span>
            📍 Jarakmu: {result?.jarak.toFixed(1)} km dari Hub Suhat
          </span>
          <button
            type="button"
            onClick={handleDeteksiUlang}
            className="shrink-0 text-tk-orange-dark underline underline-offset-4"
          >
            Deteksi ulang
          </button>
        </div>
      )}

      {error && isPermissionDenied && !manualRadius && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#C0392B]">
            Izin lokasi ditolak. Pilih radius secara manual:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setManualRadius("<3km")}
              className={cn(
                "flex-1 rounded-lg border-2 border-tk-charcoal px-3 py-2 text-xs font-bold",
                "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
              )}
            >
              &lt;3 km
            </button>
            <button
              type="button"
              onClick={() => setManualRadius("3-6km")}
              className={cn(
                "flex-1 rounded-lg border-2 border-tk-charcoal px-3 py-2 text-xs font-bold",
                "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
              )}
            >
              3–6 km
            </button>
          </div>
        </div>
      )}

      {error && !isPermissionDenied && !manualRadius && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#C0392B]">{error} Pilih radius secara manual:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setManualRadius("<3km")}
              className="flex-1 rounded-lg border-2 border-tk-charcoal bg-white px-3 py-2 text-xs font-bold text-tk-charcoal hover:bg-tk-cream-alt"
            >
              &lt;3 km
            </button>
            <button
              type="button"
              onClick={() => setManualRadius("3-6km")}
              className="flex-1 rounded-lg border-2 border-tk-charcoal bg-white px-3 py-2 text-xs font-bold text-tk-charcoal hover:bg-tk-cream-alt"
            >
              3–6 km
            </button>
          </div>
        </div>
      )}

      {manualRadius && (
        <div className="flex items-center justify-between gap-2 rounded-lg border-2 border-tk-orange bg-tk-orange/10 p-3 text-xs font-semibold text-tk-charcoal">
          <span>Radius dipilih manual: {manualRadius}</span>
          <button
            type="button"
            onClick={handleDeteksiUlang}
            className="shrink-0 text-tk-orange-dark underline underline-offset-4"
          >
            Ubah
          </button>
        </div>
      )}

      {effectiveRadius && (
        <div className="space-y-2">
          {!hideMandiriOption && (
            <button
              type="button"
              onClick={() => {
                setPendingOption(null);
                onChange(null);
              }}
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

          {visibleOptions.map((option) => {
            const isSelected = selectedOption?.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setPendingOption(option);
                  if (value?.option.id !== option.id) onChange(null);
                }}
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

          {manualRadius && (
            <p className="text-[11px] text-tk-light">
              Pastikan kamu memilih radius yang sesuai. Tarif disesuaikan saat konfirmasi
              dengan admin via WhatsApp.
            </p>
          )}
        </div>
      )}

      {selectedOption && (
        <div className="space-y-2">
          <Label className={tkLabelClass}>Pilih jenis layanan</Label>
          {LAYANAN_LIST.map((layananItem) => {
            const isSelected = value?.option.id === selectedOption.id && value?.layanan === layananItem.value;
            const harga = hargaAntarJemput(selectedOption, layananItem.value);
            const hemat =
              layananItem.value === "jemput-dan-antar"
                ? Math.max(
                    0,
                    selectedOption.hargaJemputSaja + selectedOption.hargaAntarSaja - selectedOption.hargaJemputDanAntar
                  )
                : 0;
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
                <span
                  className={cn("mt-1 block text-xs", isSelected ? "text-tk-cream/80" : "text-tk-muted")}
                >
                  {layananItem.deskripsi}
                </span>
                {hemat > 0 && (
                  <span
                    className={cn(
                      "mt-1 block text-xs font-bold",
                      isSelected ? "text-tk-cream" : "text-tk-sage-dark"
                    )}
                  >
                    Hemat {formatRupiah(hemat)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {effectiveRadius && value === null && !hideMandiriOption ? (
        <div className="rounded-lg border-2 border-tk-orange bg-tk-orange/10 p-3 text-xs text-tk-charcoal">
          📌 Jam drop-off: {JAM_DROP_OFF_MANDIRI} (Senin–Sabtu). Setelah submit, kamu
          akan menerima Kode Unik via WhatsApp. Tulis kode itu di kardus/koper
          sebelum dikirim.
        </div>
      ) : (
        effectiveRadius && (
          <p className="text-xs text-tk-light">
            Penjemputan armada TitipKuy! hanya pada jam operasional. Hari Minggu &
            tanggal merah: armada tidak tersedia, gunakan opsi kirim mandiri.
          </p>
        )
      )}
    </div>
  );
}
