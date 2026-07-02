import type { Paket } from "@/types/paket";
import { EMPTY_PENJEMPUTAN, type PenjemputanData } from "@/types/slot";

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

export interface PesanFormData {
  pelanggan: PelangganData;
  paket: Paket | null;
  tanggalMasuk: Date | null;
  deklarasi: DeklarasiData;
  antarJemput: boolean;
  penjemputan: PenjemputanData;
  fotoMasukUrls: string[];
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
  antarJemput: false,
  penjemputan: EMPTY_PENJEMPUTAN,
  fotoMasukUrls: [],
  checklist: {
    limitGantiRugi: false,
    barangTerlarang: false,
    jatuhTempo: false,
    lepasSetelah30Hari: false,
    deklarasiBenar: false,
  },
  tandaTanganDataUrl: null,
};
