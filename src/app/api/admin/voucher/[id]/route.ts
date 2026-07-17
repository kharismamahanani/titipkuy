import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { kode, persenDiskon, aktif, berlakuMulai, berlakuSampai, kuota, deskripsi } =
      body ?? {};

    if (!kode || persenDiskon == null) {
      return NextResponse.json(
        { error: "Kode dan persen diskon wajib diisi" },
        { status: 400 }
      );
    }

    const voucher = await prisma.voucher.update({
      where: { id: params.id },
      data: {
        kode: String(kode).toUpperCase(),
        persenDiskon: Number(persenDiskon),
        aktif: !!aktif,
        berlakuMulai: berlakuMulai ? new Date(berlakuMulai) : null,
        berlakuSampai: berlakuSampai ? new Date(berlakuSampai) : null,
        kuota: kuota != null && kuota !== "" ? Number(kuota) : null,
        deskripsi: deskripsi || null,
      },
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.error("[PUT /api/admin/voucher/:id]", error);
    return NextResponse.json({ error: "Gagal memperbarui voucher" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jumlahTransaksi = await prisma.transaksi.count({
      where: { voucherId: params.id },
    });

    if (jumlahTransaksi > 0) {
      return NextResponse.json(
        {
          error: `Tidak bisa menghapus — ada ${jumlahTransaksi} transaksi yang memakai voucher ini.`,
        },
        { status: 400 }
      );
    }

    await prisma.voucher.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/voucher/:id]", error);
    return NextResponse.json({ error: "Gagal menghapus voucher" }, { status: 500 });
  }
}
