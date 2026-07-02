export interface Paket {
  id: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  durasiHari: number | null;
  kategori: string;
  perluDeklarasi: boolean;
  aktif: boolean;
  urutan: number;
  createdAt: string;
  updatedAt: string;
}
