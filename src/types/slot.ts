export type Hub = "suhat" | "tidar";
export type SesiWaktu = "pagi" | "siang";
export type ArmadaTipe = "motor" | "mobil";

export interface SlotSesiInfo {
  sisa: number;
  armadaId: string | null;
}

export interface SlotAvailability {
  tanggal: string;
  hub: Hub;
  hariMinggu: boolean;
  tanggalMerah: boolean;
  liburLocked: boolean;
  pesanHariLibur: string;
  sesi: Record<SesiWaktu, { label: string; locked: boolean; motor: SlotSesiInfo; mobil: SlotSesiInfo }>;
}

export interface SlotConfig {
  lockH1: boolean;
  lockHariMinggu: boolean;
  tanggalMerah: string[];
  pesanHariLibur: string;
}

export interface PenjemputanData {
  hub: Hub | "";
  tanggal: Date | null;
  sesiWaktu: SesiWaktu | "";
  armadaTipe: ArmadaTipe | "";
  armadaId: string | null;
}

export const EMPTY_PENJEMPUTAN: PenjemputanData = {
  hub: "",
  tanggal: null,
  sesiWaktu: "",
  armadaTipe: "",
  armadaId: null,
};
