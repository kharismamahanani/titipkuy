import { prisma } from "@/lib/prisma";

export type VoucherValidasiResult =
  | { ok: true; voucher: { id: string; kode: string; persenDiskon: number } }
  | { ok: false; error: string };

// Validasi kode voucher terhadap aturan berlaku (aktif, tanggal, kuota).
// Dipakai baik oleh pengecekan publik (preview diskon) maupun saat
// transaksi benar-benar dibuat, supaya aturan tidak duplikat/berbeda.
export async function validasiVoucher(kode: string): Promise<VoucherValidasiResult> {
  const voucher = await prisma.voucher.findUnique({
    where: { kode: kode.trim().toUpperCase() },
  });

  if (!voucher) {
    return { ok: false, error: "Kode voucher tidak ditemukan" };
  }
  if (!voucher.aktif) {
    return { ok: false, error: "Kode voucher sudah tidak aktif" };
  }

  const now = new Date();
  if (voucher.berlakuMulai && now < voucher.berlakuMulai) {
    return { ok: false, error: "Kode voucher belum berlaku" };
  }
  if (voucher.berlakuSampai && now > voucher.berlakuSampai) {
    return { ok: false, error: "Kode voucher sudah kedaluwarsa" };
  }
  if (voucher.kuota !== null && voucher.terpakai >= voucher.kuota) {
    return { ok: false, error: "Kuota kode voucher sudah habis" };
  }

  return {
    ok: true,
    voucher: { id: voucher.id, kode: voucher.kode, persenDiskon: voucher.persenDiskon },
  };
}

export function terapkanDiskon(harga: number, persenDiskon: number): number {
  return Math.round(harga * (1 - persenDiskon / 100));
}
