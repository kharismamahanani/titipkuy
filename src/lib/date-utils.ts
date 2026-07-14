// Kolom @db.Date (mis. Transaksi.tanggalPenjemputan, SlotArmada.tanggal)
// disimpan sebagai UTC midnight. Semua tanggal pelanggan/admin dipilih
// berdasarkan kalender WIB, jadi objek Date apa pun (baik dari input lokal
// "yyyy-MM-dd" maupun dari ISO datetime yang dikirim browser) harus
// dinormalisasi ke tanggal kalender WIB dulu sebelum dikonversi ke UTC
// midnight — supaya "14 Juli" yang dimaksud pengguna selalu tersimpan
// sebagai 2026-07-14, terlepas dari timezone environment tempat kode ini
// dieksekusi (Vercel default UTC, bukan WIB — pakai date.getFullYear() dkk.
// langsung akan salah baca komponen tanggal dan bergeser sehari).
const JAKARTA_DATE_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toUtcMidnightFromLocalDate(date: Date): Date {
  const parts = JAKARTA_DATE_PARTS.formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return new Date(Date.UTC(year, month - 1, day));
}
