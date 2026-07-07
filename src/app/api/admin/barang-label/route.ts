import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { kodeLabel, MAX_BARANG_PER_TRANSAKSI } from "@/lib/kode";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transaksiId, deskripsi, kategori } = body ?? {};

    if (!transaksiId || !deskripsi?.trim() || !kategori) {
      return NextResponse.json(
        { error: "Deskripsi dan kategori barang wajib diisi" },
        { status: 400 }
      );
    }

    const transaksi = await prisma.transaksi.findUnique({
      where: { id: transaksiId },
    });

    if (!transaksi) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const jumlahBarang = await prisma.barangLabel.count({ where: { transaksiId } });

    if (jumlahBarang >= MAX_BARANG_PER_TRANSAKSI) {
      return NextResponse.json(
        { error: `Maksimal ${MAX_BARANG_PER_TRANSAKSI} barang per transaksi` },
        { status: 400 }
      );
    }

    try {
      const barangLabel = await prisma.barangLabel.create({
        data: {
          transaksiId,
          kodeLabel: kodeLabel(transaksi.nomorUrut, jumlahBarang),
          deskripsi,
          kategori,
        },
      });

      return NextResponse.json(barangLabel, { status: 201 });
    } catch (error) {
      const isDuplicateKode =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (isDuplicateKode) {
        return NextResponse.json(
          { error: "Kode label bertabrakan, coba tambah lagi" },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[POST /api/admin/barang-label]", error);
    return NextResponse.json({ error: "Gagal menambah barang" }, { status: 500 });
  }
}
