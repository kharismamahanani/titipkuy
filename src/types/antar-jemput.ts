export interface AntarJemputOption {
  id: string;
  label: string;
  tipe: string;
  radiusLabel: string;
  harga: number;
  hargaJemputSaja: number;
  hargaAntarSaja: number;
  hargaJemputDanAntar: number;
  kapasitasLabel: string | null;
  tipeArmada: string | null;
  aktif: boolean;
  urutan: number;
}

// Jenis layanan antar-jemput yang bisa dipilih pelanggan — independen satu
// sama lain, armada yang sama dipakai untuk kedua arah.
export type LayananAntarJemput = "jemput-saja" | "antar-saja" | "jemput-dan-antar";

export interface AntarJemputSelection {
  option: AntarJemputOption;
  layanan: LayananAntarJemput;
}

export function hargaAntarJemput(option: AntarJemputOption, layanan: LayananAntarJemput): number {
  if (layanan === "jemput-saja") return option.hargaJemputSaja;
  if (layanan === "antar-saja") return option.hargaAntarSaja;
  return option.hargaJemputDanAntar;
}

export function labelLayananAntarJemput(layanan: LayananAntarJemput): string {
  if (layanan === "jemput-saja") return "Jemput Saja";
  if (layanan === "antar-saja") return "Antar Saja";
  return "Jemput + Antar";
}
