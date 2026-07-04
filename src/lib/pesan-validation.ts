import type { Paket } from "@/types/paket";
import type { DeklarasiData, DokumenMotorData, PelangganData } from "@/types/pesan";

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
  deklarasi: DeklarasiData,
  dokumenMotor: DokumenMotorData
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

  const isMotor = paket?.kategori === "motor";

  if (!isMotor && deklarasi.nilaiDeklarasi.trim()) {
    const nilai = Number(deklarasi.nilaiDeklarasi);
    if (!Number.isFinite(nilai) || nilai <= 300_000) {
      errors.push("Nilai deklarasi minimal Rp300.001");
    }
  }

  if (isMotor && (!dokumenMotor.ktpUrl || !dokumenMotor.stnkUrl)) {
    errors.push("KTP dan STNK wajib diupload untuk paket Titip Motor");
  }

  return errors;
}
