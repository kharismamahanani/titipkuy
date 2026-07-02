import type { Paket } from "@/types/paket";
import type { DeklarasiData, PelangganData } from "@/types/pesan";
import type { PenjemputanData } from "@/types/slot";

const WHATSAPP_REGEX = /^08\d{8,11}$/;

export function validateStep1(data: PelangganData) {
  const errors: Partial<Record<keyof PelangganData, string>> = {};

  if (!data.nama.trim()) {
    errors.nama = "Nama lengkap wajib diisi";
  }

  if (!data.whatsapp.trim()) {
    errors.whatsapp = "No WhatsApp wajib diisi";
  } else if (!WHATSAPP_REGEX.test(data.whatsapp.trim())) {
    errors.whatsapp = "Format harus 08xx, contoh: 081234567890";
  }

  if (!data.alamatKos.trim()) {
    errors.alamatKos = "Alamat kos wajib diisi";
  }

  return errors;
}

export function validateStep3(fotoMasukUrls: string[]) {
  const errors: string[] = [];
  if (fotoMasukUrls.length < 3) {
    errors.push("Upload minimal 3 foto barang");
  }
  return errors;
}

export function validateStep2(
  paket: Paket | null,
  tanggalMasuk: Date | null,
  deklarasi: DeklarasiData,
  antarJemput = false,
  penjemputan?: PenjemputanData
) {
  const errors: string[] = [];

  if (!paket) errors.push("Pilih salah satu paket dahulu");
  if (!tanggalMasuk) errors.push("Pilih tanggal masuk barang");

  if (paket?.perluDeklarasi) {
    if (!deklarasi.nilaiDeklarasi.trim()) {
      errors.push("Isi nilai deklarasi barang");
    }
    if (!deklarasi.buktiKepemilikanUrl) {
      errors.push("Upload bukti kepemilikan barang");
    }
    if (!deklarasi.deskripsiDeklarasi.trim()) {
      errors.push("Isi deskripsi detail barang");
    }
  }

  if (antarJemput) {
    if (!penjemputan?.hub) errors.push("Pilih hub penjemputan");
    if (!penjemputan?.tanggal) errors.push("Pilih tanggal penjemputan");
    if (!penjemputan?.sesiWaktu || !penjemputan?.armadaTipe || !penjemputan?.armadaId) {
      errors.push("Pilih sesi dan armada penjemputan");
    }
  }

  return errors;
}
