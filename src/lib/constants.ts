export const HUB_CONFIG = {
  suhat: {
    kode: "B", // dipakai di kode label dan nomor referensi
    nama: "Hub Suhat",
    alamat: "Jl. Bunga Lely, Lowokwaru",
    deskripsi: "Dekat UB, UM, UIN",
  },
  tidar: {
    kode: "C",
    nama: "Hub Tidar",
    alamat: "Perum Tidar View, Sukun",
    deskripsi: "Kawasan tenang 24 jam",
  },
} as const;

export const SLOT_SESI = {
  pagi: { label: "Sesi Pagi", jam: "08.00 – 11.00 WIB" },
  siang: { label: "Sesi Siang", jam: "13.00 – 16.00 WIB" },
} as const;
