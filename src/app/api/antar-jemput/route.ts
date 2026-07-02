import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Publik — dipakai form pemesanan untuk menampilkan pilihan add-on antar-jemput.
export async function GET() {
  try {
    const options = await prisma.antarJemputOption.findMany({
      where: { aktif: true },
      orderBy: { urutan: "asc" },
    });
    return NextResponse.json(options);
  } catch (error) {
    console.error("[GET /api/antar-jemput]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data antar-jemput" },
      { status: 500 }
    );
  }
}
