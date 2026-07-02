import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint publik untuk halaman verifikasi (dibuka lewat scan QR di label
// barang). Sengaja hanya SELECT field yang aman ditampilkan ke siapa saja —
// bukan ambil semua data lalu disembunyikan di UI, karena response mentahnya
// tetap bisa dilihat siapa pun lewat tab Network di browser.
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id: params.id },
      select: {
        statusTransaksi: true,
        tanggalMasuk: true,
        tanggalJatuhTempo: true,
        paket: { select: { nama: true } },
        pelanggan: { select: { nama: true } },
        barangLabel: { select: { kodeLabel: true } },
      },
    });

    if (!transaksi) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cuma nama depan yang dikirim ke browser — nama lengkap tidak pernah
    // meninggalkan server untuk endpoint ini.
    const namaDepan = transaksi.pelanggan.nama.trim().split(/\s+/)[0];

    return NextResponse.json({
      namaDepan,
      paketNama: transaksi.paket.nama,
      statusTransaksi: transaksi.statusTransaksi,
      tanggalMasuk: transaksi.tanggalMasuk,
      tanggalJatuhTempo: transaksi.tanggalJatuhTempo,
      kodeLabel: transaksi.barangLabel.map((b) => b.kodeLabel),
    });
  } catch (error) {
    console.error("[GET /api/transaksi/:id/verifikasi]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data verifikasi" },
      { status: 500 }
    );
  }
}
