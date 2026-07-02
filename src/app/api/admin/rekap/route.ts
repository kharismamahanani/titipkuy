import { NextResponse } from "next/server";
import { format, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";

function getMonthRange(bulan: string) {
  const [year, month] = bulan.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bulanParam = searchParams.get("bulan");
    const bulan =
      bulanParam && /^\d{4}-\d{2}$/.test(bulanParam) ? bulanParam : format(new Date(), "yyyy-MM");
    const { start, end } = getMonthRange(bulan);

    const transaksiBulan = await prisma.transaksi.findMany({
      where: { tanggalMasuk: { gte: start, lt: end } },
      include: { paket: true },
    });

    const lunas = transaksiBulan.filter((t) => t.statusBayar === "LUNAS");
    const belumBayar = transaksiBulan.filter((t) => t.statusBayar === "BELUM_BAYAR");

    const omzetBulanIni = lunas.reduce((sum, t) => sum + t.paket.harga, 0);
    const jumlahTransaksi = transaksiBulan.length;
    const rataRataPerTransaksi = jumlahTransaksi > 0 ? omzetBulanIni / jumlahTransaksi : 0;
    const totalBelumDibayar = belumBayar.reduce((sum, t) => sum + t.paket.harga, 0);

    const breakdownMap = new Map<string, number>();
    for (const t of lunas) {
      breakdownMap.set(t.paket.nama, (breakdownMap.get(t.paket.nama) ?? 0) + t.paket.harga);
    }
    const breakdownPaket = Array.from(breakdownMap, ([nama, omzet]) => ({ nama, omzet }));

    // Data 6 bulan terakhir (termasuk bulan terpilih) untuk grafik tren
    const selectedMonthDate = start;
    const trendStart = new Date(
      selectedMonthDate.getFullYear(),
      selectedMonthDate.getMonth() - 5,
      1
    );
    const trendTransaksi = await prisma.transaksi.findMany({
      where: {
        statusBayar: "LUNAS",
        tanggalMasuk: { gte: trendStart, lt: end },
      },
      include: { paket: true },
    });

    const trendMap = new Map<string, number>();
    for (let i = 0; i < 6; i++) {
      const monthDate = subMonths(selectedMonthDate, 5 - i);
      trendMap.set(format(monthDate, "yyyy-MM"), 0);
    }
    for (const t of trendTransaksi) {
      const key = format(t.tanggalMasuk, "yyyy-MM");
      if (trendMap.has(key)) {
        trendMap.set(key, (trendMap.get(key) ?? 0) + t.paket.harga);
      }
    }
    const tren6Bulan = Array.from(trendMap, ([bulan, omzet]) => ({ bulan, omzet }));

    return NextResponse.json({
      bulan,
      omzetBulanIni,
      jumlahTransaksi,
      rataRataPerTransaksi,
      totalBelumDibayar,
      breakdownPaket,
      tren6Bulan,
    });
  } catch (error) {
    console.error("[GET /api/admin/rekap]", error);
    return NextResponse.json({ error: "Gagal mengambil data rekap" }, { status: 500 });
  }
}
