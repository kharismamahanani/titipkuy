export const GANTI_RUGI = {
  standar: {
    label: "Standar",
    plafonRupiah: 300_000,
    premiPersen: 0,
    deskripsi: "Ganti rugi maks. Rp300.000 per barang. Otomatis tanpa biaya tambahan.",
  },
  deklarasi: {
    label: "Deklarasi Mandiri",
    plafonMaksRupiah: 5_000_000,
    premiPersenPerBulan: 1,
    deskripsi: "Ganti rugi sesuai deklarasi, maks. Rp5.000.000. Premi 1%/bulan.",
  },
  bernilaiTinggi: {
    label: "Barang Bernilai Tinggi",
    plafonMaksRupiah: 20_000_000,
    premiPersenPerBulan: 2,
    syaratMinRupiah: 5_000_001,
    deskripsi: "Ganti rugi sesuai deklarasi, maks. Rp20.000.000. Premi 2%/bulan.",
  },
} as const;

export function hitungPremi(nilaiDeklarasi: number, durasiHari: number): number {
  const bulan = Math.ceil(durasiHari / 30);
  if (nilaiDeklarasi <= 0) return 0;
  const persen = nilaiDeklarasi <= 5_000_000 ? 0.01 : 0.02;
  return Math.round(nilaiDeklarasi * persen * bulan);
}

export function tentukanTier(nilaiDeklarasi: number): keyof typeof GANTI_RUGI {
  if (nilaiDeklarasi <= 0) return "standar";
  if (nilaiDeklarasi <= 5_000_000) return "deklarasi";
  return "bernilaiTinggi";
}
