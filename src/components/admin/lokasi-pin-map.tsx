"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { LeafletEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { HUB_LAT, HUB_LNG, hitungJarak } from "@/lib/haversine";
import type { KategoriJarak } from "@/hooks/use-deteksi-lokasi";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

function kategorikan(jarak: number): KategoriJarak {
  if (jarak <= 3) return "dekat";
  if (jarak <= 6) return "sedang";
  return "jauh";
}

interface LokasiPinMapProps {
  onJarakChange: (jarak: number, kategori: KategoriJarak, lat: number, lng: number) => void;
}

// Peta ini khusus dipakai admin saat mengisi order manual (bukan pelanggan
// sendiri) — beda dari useDeteksiLokasi (GPS device pelanggan), di sini
// admin menandai titik lokasi pelanggan secara visual di peta berdasarkan
// info alamat dari chat WhatsApp, lalu jarak ke hub dihitung otomatis
// dengan formula Haversine yang sama.
export function LokasiPinMap({ onJarakChange }: LokasiPinMapProps) {
  const [posisi, setPosisi] = useState<[number, number]>([HUB_LAT, HUB_LNG]);
  const [jarak, setJarak] = useState(0);

  useEffect(() => {
    // Ikon marker default Leaflet rusak saat dibundel Webpack (path asset
    // salah) — perbaiki dengan mengarahkan langsung ke file di package.
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend(e: LeafletEvent) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- L.Marker instance, tipe tidak diekspor via dynamic import
        const marker = e.target as any;
        const { lat, lng } = marker.getLatLng();
        updatePosisi(lat, lng);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function updatePosisi(lat: number, lng: number) {
    setPosisi([lat, lng]);
    const jarakBaru = hitungJarak(lat, lng, HUB_LAT, HUB_LNG);
    setJarak(jarakBaru);
    onJarakChange(jarakBaru, kategorikan(jarakBaru), lat, lng);
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border-2 border-tk-charcoal">
        <MapContainer
          center={[HUB_LAT, HUB_LNG]}
          zoom={13}
          style={{ height: "280px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={posisi}
            draggable
            eventHandlers={eventHandlers}
          />
        </MapContainer>
      </div>
      <p className="text-xs text-tk-muted">
        Geser pin ke lokasi pelanggan (berdasarkan alamat/share lokasi dari chat) — jarak ke hub:{" "}
        <span className="font-bold text-tk-charcoal">{jarak.toFixed(1)} km</span>
      </p>
    </div>
  );
}
