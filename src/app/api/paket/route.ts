import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const paket = await prisma.paket.findMany({
      where: { aktif: true },
      orderBy: { urutan: "asc" },
    });

    return NextResponse.json(paket);
  } catch (error) {
    console.error("[GET /api/paket]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data paket" },
      { status: 500 }
    );
  }
}
