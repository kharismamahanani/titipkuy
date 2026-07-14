import { differenceInCalendarDays } from "date-fns";

// Menghitung harga paket yang benar-benar tertagih. Paket kategori "harian"
// dengan durasiHari null adalah tarif PER HARI murni (mis. "Rp10.000/hari") —
// jumlah hari aktual ditentukan oleh selisih tanggalMasuk dan
// tanggalJatuhTempo, bukan cuma harga paket flat. Paket berdurasi tetap
// (bulanan/magang/motor, atau promo N-hari yang punya durasiHari terisi)
// selalu flat sebesar Paket.harga, tidak peduli tanggal jatuh tempo diubah
// admin atau tidak.
export function hitungHargaPaketTertagih(
  paket: { harga: number; kategori: string; durasiHari: number | null },
  tanggalMasuk: Date,
  tanggalJatuhTempo: Date
): number {
  if (paket.kategori !== "harian" || paket.durasiHari !== null) {
    return paket.harga;
  }

  const jumlahHari = Math.max(1, differenceInCalendarDays(tanggalJatuhTempo, tanggalMasuk));
  return paket.harga * jumlahHari;
}
