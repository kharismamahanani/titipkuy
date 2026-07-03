import { z } from "zod";

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
  tandaTanganUrl: z.string().url(),
  checklist: z.object({
    limitGantiRugi: z.boolean(),
    barangTerlarang: z.boolean(),
    jatuhTempo: z.boolean(),
    lepasSetelah30Hari: z.boolean(),
    deklarasiBenar: z.boolean().optional(),
  }),
  penjemputan: PenjemputanSchema.optional().nullable(),
  metodePengiriman: z.enum(["armada", "mandiri"]).optional().nullable(),
  antarJemputId: z.string().cuid().optional().nullable(),
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
