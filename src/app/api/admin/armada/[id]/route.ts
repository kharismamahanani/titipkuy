import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nama, tipe, platNomor, slotPerHari, aktif } = body ?? {};

    if (!nama || !tipe) {
      return NextResponse.json({ error: "Nama dan tipe wajib diisi" }, { status: 400 });
    }

    const armada = await prisma.armada.update({
      where: { id: params.id },
      data: {
        nama,
        tipe,
        platNomor: platNomor || null,
        slotPerHari: slotPerHari != null ? Number(slotPerHari) : 4,
        aktif: !!aktif,
      },
    });

    return NextResponse.json(armada);
  } catch (error) {
    console.error("[PUT /api/admin/armada/:id]", error);
    return NextResponse.json({ error: "Gagal memperbarui armada" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jumlahSlot = await prisma.slotArmada.count({ where: { armadaId: params.id } });

    if (jumlahSlot > 0) {
      return NextResponse.json(
        { error: `Tidak bisa menghapus — ada ${jumlahSlot} slot yang memakai armada ini.` },
        { status: 400 }
      );
    }

    await prisma.armada.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/armada/:id]", error);
    return NextResponse.json({ error: "Gagal menghapus armada" }, { status: 500 });
  }
}
