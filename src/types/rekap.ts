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

export interface BepTracker {
  totalModalAwal: number;
  sudahKembali: number;
  sisaModal: number;
  progressPercent: number;
  rataLaba3Bulan: number;
  estimasiBulanBEP: number | null;
  bepTercapai: boolean;
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
  bepTracker: BepTracker;
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
  subKategori: string;
  deskripsi: string;
  jumlah: number;
  createdAt: string;
}

export interface ModalAwal {
  id: string;
  nama: string;
  jumlah: number;
  tanggal: string;
  keterangan: string | null;
  createdAt: string;
}

export interface KonfigurasiKeuangan {
  id: string;
  persenOperasional: number;
  persenPengembangan: number;
  persenTabungan: number;
  persenPribadi: number;
  targetModalKembali: number;
  updatedAt: string;
}
