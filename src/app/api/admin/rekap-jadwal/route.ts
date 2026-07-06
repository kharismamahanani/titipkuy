import { NextResponse } from "next/server";
import { endOfWeek, startOfWeek } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { toUtcMidnightFromLocalDate } from "@/lib/date-utils";

// range=hari (default, hari ini) | minggu (minggu ini) | semua (tanpa filter tanggal)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "hari";
    const now = new Date();

    let tanggalFilter: { gte: Date; lte: Date } | undefined;

    if (range === "hari") {
      const hariIni = toUtcMidnightFromLocalDate(now);
      tanggalFilter = { gte: hariIni, lte: hariIni };
    } else if (range === "minggu") {
      tanggalFilter = {
        gte: toUtcMidnightFromLocalDate(startOfWeek(now, { locale: localeId })),
        lte: toUtcMidnightFromLocalDate(endOfWeek(now, { locale: localeId })),
      };
    }
    // range === "semua" -> tanggalFilter tetap undefined, tidak difilter tanggal

    const bookings = await prisma.transaksi.findMany({
      where: {
        armadaId: { not: null },
        ...(tanggalFilter ? { tanggalPenjemputan: tanggalFilter } : {}),
      },
      include: {
        pelanggan: true,
        armada: true,
        antarJemputOption: true,
      },
      orderBy: [{ tanggalPenjemputan: "asc" }, { sesiPenjemputan: "asc" }],
    });

    return NextResponse.json({ data: bookings });
  } catch (error) {
    console.error("[GET /api/admin/rekap-jadwal]", error);
    return NextResponse.json({ error: "Gagal mengambil rekap jadwal" }, { status: 500 });
  }
}
