import { NextResponse } from "next/server";
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { prisma } from "@/lib/prisma";

function parseTanggalLocal(tanggal: string) {
  const [y, m, d] = tanggal.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// range=tanggal (butuh ?tanggal=YYYY-MM-DD) | minggu (default) | bulan
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "minggu";
    const tanggalParam = searchParams.get("tanggal");
    const acuan = tanggalParam ? parseTanggalLocal(tanggalParam) : new Date();

    let gte: Date;
    let lte: Date;

    if (range === "tanggal") {
      gte = new Date(acuan.getFullYear(), acuan.getMonth(), acuan.getDate());
      lte = gte;
    } else if (range === "bulan") {
      gte = startOfMonth(acuan);
      lte = endOfMonth(acuan);
    } else {
      gte = startOfWeek(acuan, { locale: localeId });
      lte = endOfWeek(acuan, { locale: localeId });
    }

    const bookings = await prisma.transaksi.findMany({
      where: {
        armadaId: { not: null },
        tanggalPenjemputan: { gte, lte },
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
