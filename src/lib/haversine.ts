// Koordinat Hub Suhat (titik referensi jarak antar-jemput).
export const HUB_LAT = -7.953432523175671;
export const HUB_LNG = 112.62572945286746;

// Jarak garis lurus antara dua koordinat (km) memakai formula Haversine.
export function hitungJarak(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
