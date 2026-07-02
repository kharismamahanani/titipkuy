import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const label = await prisma.barangLabel.findUnique({
      where: { id: params.id },
      include: { transaksi: true },
    });

    if (!label) {
      return NextResponse.json({ error: "Label tidak ditemukan" }, { status: 404 });
    }

    if (label.transaksi.statusTransaksi !== "AKTIF") {
      return NextResponse.json(
        { error: "Hanya bisa menghapus label pada transaksi yang masih aktif" },
        { status: 400 }
      );
    }

    await prisma.barangLabel.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/label/:id]", error);
    return NextResponse.json({ error: "Gagal menghapus label" }, { status: 500 });
  }
}
