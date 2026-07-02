import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const paket = await prisma.paket.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        harga: Number(harga),
        durasiHari: durasiHari ? Number(durasiHari) : null,
        kategori,
        perluDeklarasi: !!perluDeklarasi,
        aktif: aktif ?? true,
        urutan: urutan != null ? Number(urutan) : 0,
      },
    });

    return NextResponse.json(paket, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/paket]", error);
    return NextResponse.json({ error: "Gagal menambah paket" }, { status: 500 });
  }
}
