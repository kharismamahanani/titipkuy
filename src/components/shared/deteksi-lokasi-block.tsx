"use client";

import { Loader2 } from "lucide-react";
import { tkButtonVariants } from "@/components/ui/tk-button";
import { cn } from "@/lib/utils";
import type { KategoriJarak } from "@/hooks/use-deteksi-lokasi";

interface DeteksiLokasiBlockProps {
  isDetecting: boolean;
  jarak: number | null;
  kategori: KategoriJarak | null;
  error: string | null;
  onDetect: () => void;
}

export function DeteksiLokasiBlock({
  isDetecting,
  jarak,
  kategori,
  error,
  onDetect,
}: DeteksiLokasiBlockProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onDetect}
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

      {jarak !== null && (
        <p className="text-xs font-bold text-tk-charcoal">
          Jarakmu: {jarak.toFixed(1)} km dari Hub Suhat
        </p>
      )}

      {kategori === "jauh" && (
        <p className="rounded-lg border-2 border-[#C0392B] bg-white p-2 text-xs font-semibold text-[#C0392B]">
          Di luar radius 6km. Gunakan kirim mandiri.
        </p>
      )}

      {error && (
        <p className="text-xs font-semibold text-[#C0392B]">{error}</p>
      )}

      <p className="text-[11px] text-tk-light">
        Jarak dihitung garis lurus (Haversine). Jarak aktual lewat jalan
        mungkin sedikit berbeda.
      </p>
    </div>
  );
}
