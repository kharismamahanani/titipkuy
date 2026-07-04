"use client";

import { useState } from "react";
import { HUB_LAT, HUB_LNG, hitungJarak } from "@/lib/haversine";

export type KategoriJarak = "dekat" | "sedang" | "jauh";

export interface DeteksiLokasiResult {
  jarak: number;
  kategori: KategoriJarak;
}

function kategorikan(jarak: number): KategoriJarak {
  if (jarak <= 3) return "dekat";
  if (jarak <= 6) return "sedang";
  return "jauh";
}

export function useDeteksiLokasi() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DeteksiLokasiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function detect(onResult?: (result: DeteksiLokasiResult) => void) {
    if (!navigator.geolocation) {
      setError("Perangkatmu tidak mendukung deteksi lokasi.");
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const jarak = hitungJarak(
          position.coords.latitude,
          position.coords.longitude,
          HUB_LAT,
          HUB_LNG
        );
        const next = { jarak, kategori: kategorikan(jarak) };
        setResult(next);
        setIsDetecting(false);
        onResult?.(next);
      },
      () => {
        setError("Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.");
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return { detect, isDetecting, result, error };
}
