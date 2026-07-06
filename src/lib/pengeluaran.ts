export const KATEGORI_PENGELUARAN = [
  { value: "biaya_tetap", label: "Biaya Tetap", icon: "🏠" },
  { value: "biaya_variabel", label: "Biaya Variabel", icon: "⛽" },
  { value: "pengembangan", label: "Pengembangan", icon: "🚀" },
] as const;

export type KategoriPengeluaran = (typeof KATEGORI_PENGELUARAN)[number]["value"];

export const SUBKATEGORI_BY_KATEGORI: Record<
  KategoriPengeluaran,
  { value: string; label: string }[]
> = {
  biaya_tetap: [
    { value: "listrik", label: "💡 Listrik" },
    { value: "internet", label: "📶 Internet" },
    { value: "lainnya", label: "🔧 Lainnya" },
  ],
  biaya_variabel: [
    { value: "bensin", label: "⛽ Bensin" },
    { value: "label", label: "🏷️ Label" },
    { value: "lakban", label: "📦 Lakban" },
    { value: "lainnya", label: "🔧 Lainnya" },
  ],
  pengembangan: [
    { value: "iklan", label: "📢 Iklan" },
    { value: "printer", label: "🖨️ Printer" },
    { value: "lainnya", label: "🔧 Lainnya" },
  ],
};

export const ALL_SUBKATEGORI = Array.from(
  new Set(Object.values(SUBKATEGORI_BY_KATEGORI).flatMap((list) => list.map((s) => s.value)))
);

export function labelKategoriPengeluaran(kategori: string) {
  return KATEGORI_PENGELUARAN.find((k) => k.value === kategori)?.label ?? kategori;
}

export function labelSubKategoriPengeluaran(kategori: string, subKategori: string) {
  const list = SUBKATEGORI_BY_KATEGORI[kategori as KategoriPengeluaran];
  return list?.find((s) => s.value === subKategori)?.label ?? subKategori;
}
