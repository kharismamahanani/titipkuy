import type { Paket } from "@/types/paket";
import type { AntarJemputSelection } from "@/types/antar-jemput";

export const KAMPUS_OPTIONS = ["UB", "UM", "UIN", "Lainnya"] as const;
export type Kampus = (typeof KAMPUS_OPTIONS)[number];

export interface PelangganData {
  nama: string;
  whatsapp: string;
  alamatKos: string;
  kampus: Kampus | "";
  noKtpKtm: string;
}

// Nilai deklarasi untuk sistem ganti rugi berlapis (lihat src/lib/ganti-rugi.ts).
// Kosong / "0" berarti tier "standar" (gratis, plafon Rp300.000).
export interface DeklarasiData {
  nilaiDeklarasi: string;
}

// Dokumen wajib khusus paket "Titip Motor" — lihat src/lib/supabase.ts
// (bucket "dokumen").
export interface DokumenMotorData {
  ktpUrl: string | null;
  stnkUrl: string | null;
  bpkbUrl: string | null;
}

export interface ChecklistData {
  limitGantiRugi: boolean;
  barangTerlarang: boolean;
  jatuhTempo: boolean;
  lepasSetelah30Hari: boolean;
  pengemasanWajib: boolean;
  pembayaranTidakDirefund: boolean;
  deklarasiBenar: boolean;
  motorDeklarasiBenar: boolean;
}

export type MetodePengiriman = "armada" | "mandiri";

// Satu baris paket dalam keranjang pemesanan (mis. 1 Box S + 2 Box M
// sekaligus dalam satu transaksi) — lihat ItemPesanan di prisma/schema.prisma.
export interface PesananItem {
  paket: Paket;
  jumlah: number;
}

export interface PesanFormData {
  pelanggan: PelangganData;
  // Paket "utama" (item pertama di keranjang) — tetap dipakai untuk logic
  // yang inheren satu-transaksi-satu-jenis (tanggal jatuh tempo, cek motor,
  // deklarasi, ukuran armada antar-jemput). Selalu disinkronkan otomatis
  // dari items[0] setiap kali items berubah (lihat handleItemsChange di
  // src/app/pesan/page.tsx) — jangan diubah manual terpisah dari items.
  paket: Paket | null;
  // Keranjang paket (bisa berisi kombinasi ukuran/jenis berbeda). Kosong
  // berarti belum ada paket dipilih sama sekali.
  items: PesananItem[];
  tanggalMasuk: Date | null;
  deklarasi: DeklarasiData;
  dokumenMotor: DokumenMotorData;
  metodePengiriman: MetodePengiriman;
  antarJemputSelection: AntarJemputSelection | null;
  // Durasi titip (hari) untuk paket "harian" murni (Paket.durasiHari null) —
  // tarif per hari, jumlahnya ditentukan pelanggan. Diabaikan server untuk
  // paket berdurasi tetap (bulanan/magang/motor/promo N-hari).
  jumlahHariHarian: number;
  // Jumlah barang fisik yang dititipkan — mengalikan harga paket (lihat
  // hitungHargaPaketTertagih di src/lib/harga-paket.ts).
  jumlahBarang: number;
  checklist: ChecklistData;
  tandaTanganDataUrl: string | null;
  // Kode voucher opsional; hanya dikirim ke server jika sudah tervalidasi
  // (lihat kodeVoucherValid di Step2PaketTanggal) supaya server tidak perlu
  // menerima kode yang belum pernah dicek.
  kodeVoucher: string;
  // Titik lokasi hasil deteksi GPS (lihat AntarJemputPicker.onLokasiChange) —
  // disimpan ke transaksi untuk link Google Maps di Rekap Jadwal Perjalanan.
  lokasiLat: number | null;
  lokasiLng: number | null;
}

export const INITIAL_FORM_DATA: PesanFormData = {
  pelanggan: {
    nama: "",
    whatsapp: "",
    alamatKos: "",
    kampus: "",
    noKtpKtm: "",
  },
  paket: null,
  items: [],
  tanggalMasuk: null,
  deklarasi: {
    nilaiDeklarasi: "",
  },
  dokumenMotor: {
    ktpUrl: null,
    stnkUrl: null,
    bpkbUrl: null,
  },
  metodePengiriman: "armada",
  antarJemputSelection: null,
  lokasiLat: null,
  lokasiLng: null,
  jumlahHariHarian: 1,
  jumlahBarang: 1,
  checklist: {
    limitGantiRugi: false,
    barangTerlarang: false,
    jatuhTempo: false,
    lepasSetelah30Hari: false,
    pengemasanWajib: false,
    pembayaranTidakDirefund: false,
    deklarasiBenar: false,
    motorDeklarasiBenar: false,
  },
  tandaTanganDataUrl: null,
  kodeVoucher: "",
};
