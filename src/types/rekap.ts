export interface BreakdownPaket {
  nama: string;
  omzet: number;
}

export interface TrenBulan {
  bulan: string; // format YYYY-MM
  omzet: number;
}

export interface RekapData {
  bulan: string;
  omzetBulanIni: number;
  jumlahTransaksi: number;
  rataRataPerTransaksi: number;
  totalBelumDibayar: number;
  breakdownPaket: BreakdownPaket[];
  tren6Bulan: TrenBulan[];
}

export interface PengambilanLaba {
  id: string;
  bulan: string;
  jumlah: number;
  dicatatPada: string;
}
