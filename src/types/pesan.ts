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

export interface DeklarasiData {
  nilaiDeklarasi: string;
  deskripsiDeklarasi: string;
  buktiKepemilikanUrl: string | null;
}

export interface ChecklistData {
  limitGantiRugi: boolean;
  barangTerlarang: boolean;
  jatuhTempo: boolean;
  lepasSetelah30Hari: boolean;
  deklarasiBenar: boolean;
}

export type MetodePengiriman = "armada" | "mandiri";

export interface PesanFormData {
  pelanggan: PelangganData;
  paket: Paket | null;
  tanggalMasuk: Date | null;
  deklarasi: DeklarasiData;
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
    deskripsiDeklarasi: "",
    buktiKepemilikanUrl: null,
  },
  metodePengiriman: "armada",
  antarJemputOption: null,
  checklist: {
    limitGantiRugi: false,
    barangTerlarang: false,
    jatuhTempo: false,
    lepasSetelah30Hari: false,
    deklarasiBenar: false,
  },
  tandaTanganDataUrl: null,
};
