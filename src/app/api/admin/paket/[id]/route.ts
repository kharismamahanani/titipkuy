import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      nama,
      deskripsi,
      harga,
      durasiHari,
      kategori,
      perluDeklarasi,
      aktif,
      urutan,
    } = body ?? {};

    if (!nama || !kategori || harga == null) {
      return NextResponse.json(
        { error: "Nama, kategori, dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const paket = await prisma.paket.update({
      where: { id: params.id },
      data: {
        nama,
        deskripsi: deskripsi || null,
        harga: Number(harga),
        durasiHari: durasiHari ? Number(durasiHari) : null,
        kategori,
        perluDeklarasi: !!perluDeklarasi,
        aktif: !!aktif,
        urutan: urutan != null ? Number(urutan) : 0,
      },
    });

    return NextResponse.json(paket);
  } catch (error) {
    console.error("[PUT /api/admin/paket/:id]", error);
    return NextResponse.json({ error: "Gagal memperbarui paket" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jumlahTransaksi = await prisma.transaksi.count({
      where: { paketId: params.id },
    });

    if (jumlahTransaksi > 0) {
      return NextResponse.json(
        {
          error: `Tidak bisa menghapus — ada ${jumlahTransaksi} transaksi yang memakai paket ini.`,
        },
        { status: 400 }
      );
    }

    await prisma.paket.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/paket/:id]", error);
    return NextResponse.json({ error: "Gagal menghapus paket" }, { status: 500 });
  }
}
