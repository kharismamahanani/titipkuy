export interface BreakdownPaket {
  nama: string;
  omzet: number;
}

export interface TrenBulan {
  bulan: string; // format YYYY-MM
  omzet: number;
}

export interface TrenBulanPengeluaran {
  bulan: string; // format YYYY-MM
  pengeluaran: number;
}

export interface RekapData {
  bulan: string;
  omzetBulanIni: number;
  jumlahTransaksi: number;
  rataRataPerTransaksi: number;
  totalBelumDibayar: number;
  breakdownPaket: BreakdownPaket[];
  tren6Bulan: TrenBulan[];
  pengeluaranBulanIni: number;
  tren6BulanPengeluaran: TrenBulanPengeluaran[];
}

export interface PengambilanLaba {
  id: string;
  bulan: string;
  jumlah: number;
  dicatatPada: string;
}

export interface Pengeluaran {
  id: string;
  tanggal: string;
  kategori: string;
  deskripsi: string;
  jumlah: number;
  createdAt: string;
}
