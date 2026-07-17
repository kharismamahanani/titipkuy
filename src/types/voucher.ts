export interface Voucher {
  id: string;
  kode: string;
  persenDiskon: number;
  aktif: boolean;
  berlakuMulai: string | null;
  berlakuSampai: string | null;
  kuota: number | null;
  terpakai: number;
  deskripsi: string | null;
  createdAt: string;
}
