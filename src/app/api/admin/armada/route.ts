import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const armada = await prisma.armada.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(armada);
  } catch (error) {
    console.error("[GET /api/admin/armada]", error);
    return NextResponse.json({ error: "Gagal mengambil data armada" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, tipe, platNomor, slotPerHari, aktif } = body ?? {};

    if (!nama || !tipe) {
      return NextResponse.json({ error: "Nama dan tipe wajib diisi" }, { status: 400 });
    }

    const armada = await prisma.armada.create({
      data: {
        nama,
        tipe,
        platNomor: platNomor || null,
        slotPerHari: slotPerHari != null ? Number(slotPerHari) : 4,
        aktif: aktif ?? true,
      },
    });

    return NextResponse.json(armada, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/armada]", error);
    return NextResponse.json({ error: "Gagal menambah armada" }, { status: 500 });
  }
}
