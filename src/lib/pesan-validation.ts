import type { Paket } from "@/types/paket";
import type { DeklarasiData, PelangganData } from "@/types/pesan";

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

export function validateStep2(
  paket: Paket | null,
  tanggalMasuk: Date | null,
  deklarasi: DeklarasiData
) {
  const errors: string[] = [];

  if (!paket) errors.push("Pilih salah satu paket dahulu");
  if (!tanggalMasuk) errors.push("Pilih tanggal masuk barang");

  if (tanggalMasuk?.getDay() === 0) {
    errors.push("Hub tutup di hari Minggu. Silakan pilih hari lain.");
  }

  if (tanggalMasuk?.getDay() === 6 && paket?.durasiHari === 1) {
    errors.push(
      "Titip 1 hari di hari Sabtu tidak tersedia karena hub tutup di hari Minggu. Pilih durasi minimal 2 hari, atau pilih hari lain."
    );
  }

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

  return errors;
}
