export const KATEGORI_PENGELUARAN = [
  { value: "bensin", label: "⛽ Bensin armada" },
  { value: "label", label: "🏷️ Label & alat tulis" },
  { value: "packaging", label: "📦 Perlengkapan packaging (lakban, bubble wrap)" },
  { value: "listrik", label: "💡 Listrik & utilitas" },
  { value: "servisArmada", label: "🛵 Servis/perawatan armada" },
  { value: "komunikasi", label: "📱 Biaya komunikasi (WA/internet)" },
  { value: "lainnya", label: "🔧 Lainnya" },
] as const;

export type KategoriPengeluaran = (typeof KATEGORI_PENGELUARAN)[number]["value"];

export function labelKategoriPengeluaran(kategori: string) {
  return KATEGORI_PENGELUARAN.find((k) => k.value === kategori)?.label ?? kategori;
}
