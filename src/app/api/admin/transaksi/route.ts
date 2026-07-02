import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json([]);
    }

    const transaksi = await prisma.transaksi.findMany({
      where: {
        OR: [
          { nomorRef: { contains: q, mode: "insensitive" } },
          { pelanggan: { nama: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { pelanggan: true, paket: true, barangLabel: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(transaksi);
  } catch (error) {
    console.error("[GET /api/admin/transaksi]", error);
    return NextResponse.json({ error: "Gagal mencari transaksi" }, { status: 500 });
  }
}
