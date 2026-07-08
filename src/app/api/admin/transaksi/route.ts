import { NextResponse } from "next/server";
import type { Prisma, StatusTransaksi } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildKodeSearchFilter } from "@/lib/kode-search";

const VALID_STATUS: StatusTransaksi[] = ["AKTIF", "SELESAI", "DIBATALKAN"];
const DEFAULT_LIMIT = 20;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") ?? searchParams.get("q"))?.trim();
    const status = searchParams.get("status")?.trim();
    const paketId = searchParams.get("paketId")?.trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT);

    const where: Prisma.TransaksiWhereInput = {
      ...(search ? { OR: buildKodeSearchFilter(search) } : {}),
      ...(status && status !== "all" && VALID_STATUS.includes(status as StatusTransaksi)
        ? { statusTransaksi: status as StatusTransaksi }
        : {}),
      ...(paketId ? { paketId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.transaksi.findMany({
        where,
        include: { pelanggan: true, paket: true, barangLabel: true, antarJemputOption: true, armada: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaksi.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error("[GET /api/admin/transaksi]", error);
    return NextResponse.json({ error: "Gagal mengambil data transaksi" }, { status: 500 });
  }
}
