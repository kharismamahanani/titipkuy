export interface Armada {
  id: string;
  nama: string;
  tipe: string;
  platNomor: string | null;
  slotPerHari: number;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KonfigurasiOperasional {
  id: string;
  lockH1: boolean;
  lockHariMinggu: boolean;
  tanggalMerah: string[];
  pesanHariLibur: string;
  updatedAt: string;
}
