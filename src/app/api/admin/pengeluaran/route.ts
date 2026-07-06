import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PengeluaranSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const bulan = Number(searchParams.get("bulan")) || now.getMonth() + 1;
    const tahun = Number(searchParams.get("tahun")) || now.getFullYear();

    const start = new Date(tahun, bulan - 1, 1);
    const end = new Date(tahun, bulan, 1);

    const pengeluaran = await prisma.pengeluaran.findMany({
      where: { tanggal: { gte: start, lt: end } },
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json(pengeluaran);
  } catch (error) {
    console.error("[GET /api/admin/pengeluaran]", error);
    return NextResponse.json({ error: "Gagal mengambil data pengeluaran" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PengeluaranSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tanggal, kategori, subKategori, deskripsi, jumlah } = parsed.data;

    const pengeluaran = await prisma.pengeluaran.create({
      data: {
        tanggal: new Date(tanggal),
        kategori,
        subKategori,
        deskripsi,
        jumlah,
      },
    });

    return NextResponse.json(pengeluaran, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/pengeluaran]", error);
    return NextResponse.json({ error: "Gagal menyimpan pengeluaran" }, { status: 500 });
  }
}
