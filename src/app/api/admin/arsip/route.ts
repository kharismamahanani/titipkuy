import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUS = ["AKTIF", "SELESAI", "DIBATALKAN"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();

    const transaksi = await prisma.transaksi.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { nomorRef: { contains: search, mode: "insensitive" } },
                { pelanggan: { nama: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(status && VALID_STATUS.includes(status)
          ? { statusTransaksi: status as "AKTIF" | "SELESAI" | "DIBATALKAN" }
          : {}),
      },
      include: { pelanggan: true, paket: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(transaksi);
  } catch (error) {
    console.error("[GET /api/admin/arsip]", error);
    return NextResponse.json({ error: "Gagal mengambil data arsip" }, { status: 500 });
  }
}
