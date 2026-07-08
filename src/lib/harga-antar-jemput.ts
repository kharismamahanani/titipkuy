import { hargaAntarJemput, type AntarJemputOption } from "@/types/antar-jemput";

// Harga add-on antar-jemput yang benar-benar berlaku untuk sebuah transaksi,
// berdasarkan kombinasi layananJemput/layananAntar yang dipilih pelanggan.
export function hargaAntarJemputTransaksi(transaksi: {
  antarJemputOption: AntarJemputOption | null;
  layananJemput: boolean;
  layananAntar: boolean;
}): number {
  if (!transaksi.antarJemputOption) return 0;
  if (transaksi.layananJemput && transaksi.layananAntar) {
    return hargaAntarJemput(transaksi.antarJemputOption, "jemput-dan-antar");
  }
  if (transaksi.layananAntar) {
    return hargaAntarJemput(transaksi.antarJemputOption, "antar-saja");
  }
  if (transaksi.layananJemput) {
    return hargaAntarJemput(transaksi.antarJemputOption, "jemput-saja");
  }
  return 0;
}
