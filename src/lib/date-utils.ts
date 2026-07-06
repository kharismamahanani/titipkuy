// Kolom @db.Date (mis. Transaksi.tanggalPenjemputan, SlotArmada.tanggal)
// disimpan sebagai UTC midnight. Server berjalan di WIB, jadi objek Date apa
// pun (baik dari input lokal "yyyy-MM-dd" maupun dari ISO datetime pelanggan)
// harus dinormalisasi lewat komponen kalender LOKAL sebelum dikonversi ke
// UTC midnight — supaya "10 Juli" yang dimaksud pengguna selalu tersimpan
// sebagai 2026-07-10, bukan bergeser sehari karena offset WIB (+7).
export function toUtcMidnightFromLocalDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
