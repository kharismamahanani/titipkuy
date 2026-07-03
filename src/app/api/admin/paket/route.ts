import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaketSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const paket = await prisma.paket.findMany({
      orderBy: { urutan: "asc" },
    });
    return NextResponse.json(paket);
  } catch (error) {
    console.error("[GET /api/admin/paket]", error);
    return NextResponse.json({ error: "Gagal mengambil data paket" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PaketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nama, deskripsi, harga, durasiHari, kategori, perluDeklarasi, aktif, urutan } =
      parsed.data;

    const paket = await prisma.paket.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        harga,
        durasiHari: durasiHari ?? null,
        kategori,
        perluDeklarasi,
        aktif,
        urutan,
      },
    });

    return NextResponse.json(paket, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/paket]", error);
    return NextResponse.json({ error: "Gagal menambah paket" }, { status: 500 });
  }
}
