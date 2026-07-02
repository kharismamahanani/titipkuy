import type { Paket } from "@/types/paket";

export interface Pelanggan {
  id: string;
  nama: string;
  whatsapp: string;
  alamatKos: string;
  noKtpKtm: string | null;
  kampus: string | null;
  createdAt: string;
}

export interface BarangLabel {
  id: string;
  transaksiId: string;
  kodeLabel: string;
  deskripsi: string;
  kategori: string;
  createdAt: string;
}

export interface Foto {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
}

export interface TransaksiDetail {
  id: string;
  nomorRef: string;
  pelanggan: Pelanggan;
  paket: Paket;
  nilaiDeklarasi: number | null;
  deskripsiDeklarasi: string | null;
  buktiKepemilikanUrl: string | null;
  tanggalMasuk: string;
  tanggalJatuhTempo: string;
  statusBayar: "BELUM_BAYAR" | "LUNAS";
  statusTransaksi: "AKTIF" | "SELESAI" | "DIBATALKAN";
  tandaTanganUrl: string | null;
  pdfUrl: string | null;
  createdAt: string;
}

export interface TransaksiSearchResult extends TransaksiDetail {
  barangLabel: BarangLabel[];
}

export interface TransaksiFull extends TransaksiDetail {
  barangLabel: BarangLabel[];
  fotoMasuk: Foto[];
  fotoKeluar: Foto[];
}

// Data minimal untuk halaman verifikasi publik (dibuka lewat scan QR) —
// sengaja TIDAK memuat nama lengkap, No. KTP/KTM, alamat, No. WhatsApp,
// atau nilai deklarasi.
export interface VerifikasiPublik {
  namaDepan: string;
  paketNama: string;
  statusTransaksi: "AKTIF" | "SELESAI" | "DIBATALKAN";
  tanggalMasuk: string;
  tanggalJatuhTempo: string;
  kodeLabel: string[];
}
