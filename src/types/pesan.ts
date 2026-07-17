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

export interface PesanFormData {
  pelanggan: PelangganData;
  paket: Paket | null;
  tanggalMasuk: Date | null;
  deklarasi: DeklarasiData;
  dokumenMotor: DokumenMotorData;
  metodePengiriman: MetodePengiriman;
  antarJemputSelection: AntarJemputSelection | null;
  // Durasi titip (hari) untuk paket "harian" murni (Paket.durasiHari null) —
  // tarif per hari, jumlahnya ditentukan pelanggan. Diabaikan server untuk
  // paket berdurasi tetap (bulanan/magang/motor/promo N-hari).
  jumlahHariHarian: number;
  checklist: ChecklistData;
  tandaTanganDataUrl: string | null;
  // Kode voucher opsional; hanya dikirim ke server jika sudah tervalidasi
  // (lihat kodeVoucherValid di Step2PaketTanggal) supaya server tidak perlu
  // menerima kode yang belum pernah dicek.
  kodeVoucher: string;
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
  jumlahHariHarian: 1,
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
