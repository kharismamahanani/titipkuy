import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateKodeLabel } from "@/lib/label-kode";

const MAX_KODE_LABEL_RETRY = 5;

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
      include: { paket: true },
    });

    if (!transaksi) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    for (let attempt = 0; attempt < MAX_KODE_LABEL_RETRY; attempt++) {
      try {
        const jumlahLabel = await prisma.barangLabel.count();
        const kodeLabel = generateKodeLabel(transaksi.paket, kategori, jumlahLabel + 1 + attempt);

        const barangLabel = await prisma.barangLabel.create({
          data: {
            transaksiId,
            kodeLabel,
            deskripsi,
            kategori,
          },
        });

        return NextResponse.json(barangLabel, { status: 201 });
      } catch (error) {
        const isDuplicateKode =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!isDuplicateKode) throw error;
      }
    }

    return NextResponse.json(
      { error: "Gagal membuat kode label, coba lagi" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[POST /api/admin/barang-label]", error);
    return NextResponse.json({ error: "Gagal menambah barang" }, { status: 500 });
  }
}
