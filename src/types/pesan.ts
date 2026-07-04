import type { Paket } from "@/types/paket";
import type { AntarJemputOption } from "@/types/antar-jemput";

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
  antarJemputOption: AntarJemputOption | null;
  checklist: ChecklistData;
  tandaTanganDataUrl: string | null;
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
  antarJemputOption: null,
  checklist: {
    limitGantiRugi: false,
    barangTerlarang: false,
    jatuhTempo: false,
    lepasSetelah30Hari: false,
    pengemasanWajib: false,
    deklarasiBenar: false,
    motorDeklarasiBenar: false,
  },
  tandaTanganDataUrl: null,
};
