import { z } from "zod";
import { ALL_SUBKATEGORI, KATEGORI_PENGELUARAN } from "@/lib/pengeluaran";

export const PelangganSchema = z.object({
  nama: z.string().min(2).max(100),
  whatsapp: z.string().regex(/^(08|\+628)\d{8,11}$/, "Format WA tidak valid"),
  alamatKos: z.string().min(5).max(300),
  kampus: z.string().optional().nullable(),
  noKtpKtm: z.string().optional().nullable(),
});

// Dipakai admin saat membuat order manual — alamat kos boleh menyusul.
export const PelangganManualSchema = PelangganSchema.extend({
  alamatKos: z.string().max(300).optional(),
});

export const PenjemputanSchema = z.object({
  hub: z.enum(["suhat", "tidar"]),
  tanggal: z.string().min(1),
  sesiWaktu: z.enum(["pagi", "siang"]),
  armadaTipe: z.enum(["motor", "mobil"]).optional(),
  armadaId: z.string().cuid(),
});

// POST /api/transaksi — pemesanan publik dari form /pesan
export const TransaksiSchema = z.object({
  id: z.string().uuid(),
  pelanggan: PelangganSchema,
  paketId: z.string().cuid(),
  tanggalMasuk: z.string().datetime(),
  nilaiDeklarasi: z.number().positive().optional().nullable(),
  deskripsiDeklarasi: z.string().optional().nullable(),
  buktiKepemilikanUrl: z.string().url().optional().nullable(),
  tierGantiRugi: z.enum(["standar", "deklarasi", "bernilaiTinggi"]).optional().nullable(),
  premiGantiRugi: z.number().int().min(0).optional().nullable(),
  ktpUrl: z.string().url().optional().nullable(),
  stnkUrl: z.string().url().optional().nullable(),
  bpkbUrl: z.string().url().optional().nullable(),
  tandaTanganUrl: z.string().url(),
  checklist: z.object({
    pengemasanWajib: z.boolean(),
    limitGantiRugi: z.boolean(),
    barangTerlarang: z.boolean(),
    jatuhTempo: z.boolean(),
    lepasSetelah30Hari: z.boolean(),
    deklarasiBenar: z.boolean().optional(),
    motorDeklarasiBenar: z.boolean().optional(),
  }),
  penjemputan: PenjemputanSchema.optional().nullable(),
  metodePengiriman: z.enum(["armada", "mandiri"]).optional().nullable(),
  antarJemputId: z.string().cuid().optional().nullable(),
  // Jemput dan Antar independen — pelanggan bisa pilih salah satu atau
  // keduanya (harga bundling ditentukan lewat AntarJemputOption).
  layananJemput: z.boolean().optional(),
  layananAntar: z.boolean().optional(),
});

// POST /api/cek-pesanan — cek status pesanan publik (kode transaksi + WA)
export const CekPesananSchema = z.object({
  kodeTransaksi: z.string().min(1, "Kode transaksi wajib diisi"),
  whatsapp: z.string().min(1, "No WhatsApp wajib diisi"),
});

// POST /api/admin/paket
export const PaketSchema = z.object({
  nama: z.string().min(2).max(100),
  deskripsi: z.string().optional().nullable(),
  harga: z.number().int().positive(),
  durasiHari: z.number().int().positive().optional().nullable(),
  kategori: z.enum(["harian", "bulanan", "magang", "pindahan", "motor"]),
  perluDeklarasi: z.boolean().default(false),
  aktif: z.boolean().default(true),
  urutan: z.number().int().default(0),
});

// POST /api/admin/transaksi/manual — order manual via WhatsApp oleh admin
export const TransaksiManualSchema = z.object({
  id: z.string().uuid(),
  pelanggan: PelangganManualSchema,
  paketId: z.string().cuid(),
  tanggalMasuk: z.string().datetime(),
  tanggalJatuhTempo: z.string().datetime().optional().nullable(),
  hub: z.enum(["suhat", "tidar"]),
  zonaRak: z.string().optional().nullable(),
  nilaiDeklarasi: z.number().positive().optional().nullable(),
  deskripsiDeklarasi: z.string().optional().nullable(),
  buktiKepemilikanUrl: z.string().url().optional().nullable(),
  antarJemput: z.boolean().optional(),
  penjemputan: PenjemputanSchema.optional().nullable(),
  catatanAdmin: z.string().optional().nullable(),
});

// POST /api/admin/pengeluaran
export const PengeluaranSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  kategori: z.enum(KATEGORI_PENGELUARAN.map((k) => k.value) as [string, ...string[]]),
  subKategori: z.enum(ALL_SUBKATEGORI as [string, ...string[]]),
  deskripsi: z.string().min(1, "Deskripsi wajib diisi").max(200),
  jumlah: z.number().int().positive(),
});

// POST /api/admin/modal-awal
export const ModalAwalSchema = z.object({
  nama: z.string().min(1, "Nama item wajib diisi").max(200),
  jumlah: z.number().int().positive(),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  keterangan: z.string().max(300).optional().nullable(),
});

// PUT /api/admin/konfigurasi-keuangan
export const KonfigurasiKeuanganSchema = z
  .object({
    persenOperasional: z.number().int().min(0).max(100),
    persenPengembangan: z.number().int().min(0).max(100),
    persenTabungan: z.number().int().min(0).max(100),
    persenPribadi: z.number().int().min(0).max(100),
    targetModalKembali: z.number().int().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    const total =
      data.persenOperasional + data.persenPengembangan + data.persenTabungan + data.persenPribadi;
    if (total !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total persentase harus 100% (saat ini ${total}%)`,
        path: ["persenOperasional"],
      });
    }
  });
