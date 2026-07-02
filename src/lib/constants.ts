export const HUB_CONFIG = {
  suhat: {
    kode: "B", // dipakai di kode label dan nomor referensi
    nama: "Hub Suhat",
    alamat: "Jl. Bunga Lely, Lowokwaru",
    deskripsi: "Dekat UB, UM, UIN",
    aktif: true,
    catatan: "",
  },
  tidar: {
    kode: "C",
    nama: "Hub Tidar",
    alamat: "Perum Tidar View, Sukun",
    deskripsi: "Kawasan tenang 24 jam",
    // Nonaktif sementara — JANGAN hapus dari konstanta ini, cukup ubah
    // `aktif` ke true lagi saat hub ini siap beroperasi.
    aktif: false,
    catatan: "Segera hadir",
  },
} as const;

// Kunci hub yang sedang aktif beroperasi, dipakai untuk membangun pilihan
// di UI (picker hub) tanpa hardcode ulang di tiap tempat.
export const AKTIF_HUB_KEYS = (Object.keys(HUB_CONFIG) as (keyof typeof HUB_CONFIG)[]).filter(
  (key) => HUB_CONFIG[key].aktif
);

export const JAM_OPERASIONAL_HUB_SUHAT = {
  hari: "Senin – Sabtu: 08.00 – 17.00 WIB",
  libur: "Minggu & Tanggal Merah: TUTUP",
};

export const JAM_DROP_OFF_MANDIRI = "08.00–10.00 WIB atau 15.00–17.00 WIB";

export const SLOT_SESI = {
  pagi: { label: "Sesi Pagi", jam: "08.00 – 11.00 WIB" },
  siang: { label: "Sesi Siang", jam: "13.00 – 16.00 WIB" },
} as const;
