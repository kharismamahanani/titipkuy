import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id: params.id },
      include: { pelanggan: true, paket: true, antarJemputOption: true },
    });

    if (!transaksi) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaksi);
  } catch (error) {
    console.error("[GET /api/transaksi/:id]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { pdfUrl } = body ?? {};

    if (!pdfUrl) {
      return NextResponse.json({ error: "pdfUrl wajib diisi" }, { status: 400 });
    }

    if (typeof pdfUrl !== "string" || !pdfUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "pdfUrl harus berupa URL https:// yang valid" },
        { status: 400 }
      );
    }

    const transaksi = await prisma.transaksi.update({
      where: { id: params.id },
      data: { pdfUrl },
    });

    return NextResponse.json({ id: transaksi.id, pdfUrl: transaksi.pdfUrl });
  } catch (error) {
    console.error("[PATCH /api/transaksi/:id]", error);
    return NextResponse.json(
      { error: "Gagal menyimpan PDF pernyataan" },
      { status: 500 }
    );
  }
}
