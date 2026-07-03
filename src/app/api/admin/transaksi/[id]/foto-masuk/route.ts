import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { urls } = body ?? {};

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Tidak ada foto untuk disimpan" }, { status: 400 });
    }

    await prisma.fotoBarang.createMany({
      data: urls.map((url: string) => ({
        transaksiMasukId: params.id,
        url,
        fileName: url.split("/").pop() ?? "foto.jpg",
      })),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/admin/transaksi/:id/foto-masuk]", error);
    return NextResponse.json({ error: "Gagal menyimpan foto masuk" }, { status: 500 });
  }
}
