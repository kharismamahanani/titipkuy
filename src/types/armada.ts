export interface Armada {
  id: string;
  nama: string;
  tipe: string;
  platNomor: string | null;
  slotPerHari: number;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
  // Jumlah AntarJemputOption aktif yang tipeArmada-nya cocok dengan armada
  // ini — dihitung server-side, hanya ada di response GET /api/admin/armada.
  jumlahAntarJemputOption?: number;
}

export interface KonfigurasiOperasional {
  id: string;
  lockH1: boolean;
  lockHariMinggu: boolean;
  tanggalMerah: string[];
  pesanHariLibur: string;
  updatedAt: string;
}
