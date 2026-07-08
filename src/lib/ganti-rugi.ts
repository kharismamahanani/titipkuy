// Nilai plafon mentah — dipakai saat butuh angka tanpa melalui objek
// GANTI_RUGI di bawah (mis. interpolasi teks template statis).
export const GANTI_RUGI_STANDAR = 300_000;
export const GANTI_RUGI_DEKLARASI_MAKS = 5_000_000;
export const GANTI_RUGI_TINGGI_MAKS = 20_000_000;

export const GANTI_RUGI = {
  standar: {
    label: "Standar",
    plafonRupiah: GANTI_RUGI_STANDAR,
    premiPersen: 0,
    deskripsi: `Ganti rugi maks. Rp${GANTI_RUGI_STANDAR.toLocaleString("id-ID")} per barang. Otomatis tanpa biaya tambahan.`,
  },
  deklarasi: {
    label: "Deklarasi Mandiri",
    plafonMaksRupiah: GANTI_RUGI_DEKLARASI_MAKS,
    premiPersenPerBulan: 1,
    deskripsi: `Ganti rugi sesuai deklarasi, maks. Rp${GANTI_RUGI_DEKLARASI_MAKS.toLocaleString("id-ID")}. Premi 1%/bulan.`,
  },
  bernilaiTinggi: {
    label: "Barang Bernilai Tinggi",
    plafonMaksRupiah: GANTI_RUGI_TINGGI_MAKS,
    premiPersenPerBulan: 2,
    syaratMinRupiah: GANTI_RUGI_DEKLARASI_MAKS + 1,
    deskripsi: `Ganti rugi sesuai deklarasi, maks. Rp${GANTI_RUGI_TINGGI_MAKS.toLocaleString("id-ID")}. Premi 2%/bulan.`,
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
