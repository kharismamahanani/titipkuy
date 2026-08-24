import { differenceInCalendarDays } from "date-fns";

// Paket "harian" murni, termasuk Titip Motor harian, dengan durasiHari null
// adalah tarif PER HARI (mis. "Rp10.000/hari") — jumlah hari ditentukan oleh
// pelanggan/tanggal aktual, bukan fixed. Paket berdurasi tetap (mingguan/
// bulanan/magang, atau promo N-hari yang punya durasiHari terisi) selalu
// flat sebesar Paket.harga.
export function isPaketHarianFleksibel(paket: {
  kategori: string;
  durasiHari: number | null;
}): boolean {
  return (paket.kategori === "harian" || paket.kategori === "motor") && paket.durasiHari === null;
}

// Tab tampilan (Harian/Mingguan/Bulanan) yang seharusnya menampilkan paket
// ini. Untuk kategori "harian"/"mingguan" ini sama dengan kategorinya
// sendiri; untuk "motor" (yang punya varian harian/mingguan/bulanan tapi
// semuanya berkategori "motor") ditentukan dari durasiHari-nya. Kategori
// lain (bulanan/magang/pindahan) selalu masuk tab Bulanan.
export function getPaketDurasiTier(paket: {
  kategori: string;
  durasiHari: number | null;
}): "harian" | "mingguan" | "bulanan" {
  if (paket.kategori === "harian") return "harian";
  if (paket.kategori === "mingguan") return "mingguan";
  if (paket.kategori === "motor") {
    if (paket.durasiHari === null) return "harian";
    if (paket.durasiHari === 7) return "mingguan";
    return "bulanan";
  }
  return "bulanan";
}

// Menghitung harga paket yang benar-benar tertagih.
export function hitungHargaPaketTertagih(
  paket: { harga: number; kategori: string; durasiHari: number | null },
  tanggalMasuk: Date,
  tanggalJatuhTempo: Date,
  jumlahBarang: number
): number {
  const pengaliBarang = Math.max(1, jumlahBarang);

  if (!isPaketHarianFleksibel(paket)) {
    return paket.harga * pengaliBarang;
  }

  const jumlahHari = Math.max(1, differenceInCalendarDays(tanggalJatuhTempo, tanggalMasuk));
  return paket.harga * jumlahHari * pengaliBarang;
}
