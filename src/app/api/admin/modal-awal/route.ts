import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ModalAwalSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const modalAwal = await prisma.modalAwal.findMany({
      orderBy: { tanggal: "desc" },
    });
    return NextResponse.json(modalAwal);
  } catch (error) {
    console.error("[GET /api/admin/modal-awal]", error);
    return NextResponse.json({ error: "Gagal mengambil data modal awal" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ModalAwalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nama, jumlah, tanggal, keterangan } = parsed.data;

    const modalAwal = await prisma.modalAwal.create({
      data: {
        nama,
        jumlah,
        tanggal: new Date(tanggal),
        keterangan: keterangan || null,
      },
    });

    return NextResponse.json(modalAwal, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/modal-awal]", error);
    return NextResponse.json({ error: "Gagal menyimpan modal awal" }, { status: 500 });
  }
}
