import { HUB_CONFIG } from "@/lib/constants";

const BARANG_KODE_MAP: Record<string, string> = {
  kardus: "KD",
  elektronik: "EL",
  motor: "MT",
  lainnya: "LN",
};

function getPaketCode(paket: { kategori: string; durasiHari: number | null }) {
  const letter = paket.kategori.charAt(0).toUpperCase();
  if (!paket.durasiHari) return letter; // harian
  const bulan = Math.round(paket.durasiHari / 30) || 1;
  return `${letter}${bulan}`;
}

// Format: TK-[HUB]-[PAKET]-[BARANG]-[XXXX], contoh: TK-B-M3-KD-0042
export function generateKodeLabel(
  paket: { kategori: string; durasiHari: number | null },
  kategoriBarang: string,
  urutan: number
) {
  const paketCode = getPaketCode(paket);
  const barangCode = BARANG_KODE_MAP[kategoriBarang] ?? "LN";
  const urutanStr = String(urutan).padStart(4, "0");
  return `TK-${HUB_CONFIG.suhat.kode}-${paketCode}-${barangCode}-${urutanStr}`;
}
