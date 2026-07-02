-- CreateEnum
CREATE TYPE "StatusBayar" AS ENUM ('BELUM_BAYAR', 'LUNAS');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('AKTIF', 'SELESAI', 'DIBATALKAN');

-- CreateTable
CREATE TABLE "Pelanggan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "alamatKos" TEXT NOT NULL,
    "noKtpKtm" TEXT,
    "kampus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pelanggan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paket" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "harga" INTEGER NOT NULL,
    "durasiHari" INTEGER,
    "kategori" TEXT NOT NULL,
    "perluDeklarasi" BOOLEAN NOT NULL DEFAULT false,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "nomorRef" TEXT NOT NULL,
    "pelangganId" TEXT NOT NULL,
    "paketId" TEXT NOT NULL,
    "nilaiDeklarasi" INTEGER,
    "deskripsiDeklarasi" TEXT,
    "buktiKepemilikanUrl" TEXT,
    "tanggalMasuk" TIMESTAMP(3) NOT NULL,
    "tanggalJatuhTempo" TIMESTAMP(3) NOT NULL,
    "statusBayar" "StatusBayar" NOT NULL DEFAULT 'BELUM_BAYAR',
    "statusTransaksi" "StatusTransaksi" NOT NULL DEFAULT 'AKTIF',
    "zonaRak" TEXT,
    "catatanAdmin" TEXT,
    "perjanjianDisetujui" BOOLEAN NOT NULL DEFAULT false,
    "waktuPersetujuan" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "pdfUrl" TEXT,
    "klausulLimitGantiRugi" BOOLEAN NOT NULL DEFAULT false,
    "klausulBarangTerlarang" BOOLEAN NOT NULL DEFAULT false,
    "klausulJatuhTempo" BOOLEAN NOT NULL DEFAULT false,
    "klausulDeklarasiNilai" BOOLEAN NOT NULL DEFAULT false,
    "tandaTanganUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoBarang" (
    "id" TEXT NOT NULL,
    "transaksiMasukId" TEXT,
    "transaksiKeluarId" TEXT,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoBarang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarangLabel" (
    "id" TEXT NOT NULL,
    "transaksiId" TEXT NOT NULL,
    "kodeLabel" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarangLabel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaksi_nomorRef_key" ON "Transaksi"("nomorRef");

-- CreateIndex
CREATE UNIQUE INDEX "BarangLabel_kodeLabel_key" ON "BarangLabel"("kodeLabel");

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "Paket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoBarang" ADD CONSTRAINT "FotoBarang_transaksiMasukId_fkey" FOREIGN KEY ("transaksiMasukId") REFERENCES "Transaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoBarang" ADD CONSTRAINT "FotoBarang_transaksiKeluarId_fkey" FOREIGN KEY ("transaksiKeluarId") REFERENCES "Transaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarangLabel" ADD CONSTRAINT "BarangLabel_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
