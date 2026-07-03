import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { label, tipe, radiusLabel, harga, kapasitasLabel, tipeArmada, aktif, urutan } =
      body ?? {};

    if (!label || !tipe || !radiusLabel || harga == null) {
      return NextResponse.json(
        { error: "Label, tipe, radius, dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const option = await prisma.antarJemputOption.update({
      where: { id: params.id },
      data: {
        label,
        tipe,
        radiusLabel,
        harga: Number(harga),
        kapasitasLabel: kapasitasLabel || null,
        tipeArmada: tipeArmada || tipe,
        aktif: !!aktif,
        urutan: urutan != null ? Number(urutan) : 0,
      },
    });

    return NextResponse.json(option);
  } catch (error) {
    console.error("[PUT /api/admin/antar-jemput/:id]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui opsi antar-jemput" },
      { status: 500 }
    );
  }
}

// Soft delete — set aktif:false, tidak dihapus dari DB (transaksi lama
// yang masih mereferensikan option ini tetap valid).
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.antarJemputOption.update({
      where: { id: params.id },
      data: { aktif: false },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/antar-jemput/:id]", error);
    return NextResponse.json(
      { error: "Gagal menonaktifkan opsi antar-jemput" },
      { status: 500 }
    );
  }
}
