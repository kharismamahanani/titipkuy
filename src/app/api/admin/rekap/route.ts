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

    const pengeluaranBulan = await prisma.pengeluaran.findMany({
      where: { tanggal: { gte: start, lt: end } },
    });
    const pengeluaranBulanIni = pengeluaranBulan.reduce((sum, p) => sum + p.jumlah, 0);

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

    // Pengeluaran per bulan untuk 6 bulan yang sama, dipakai grafik omzet vs pengeluaran
    const trendPengeluaran = await prisma.pengeluaran.findMany({
      where: { tanggal: { gte: trendStart, lt: end } },
    });
    const pengeluaranTrendMap = new Map<string, number>();
    for (let i = 0; i < 6; i++) {
      const monthDate = subMonths(selectedMonthDate, 5 - i);
      pengeluaranTrendMap.set(format(monthDate, "yyyy-MM"), 0);
    }
    for (const p of trendPengeluaran) {
      const key = format(p.tanggal, "yyyy-MM");
      if (pengeluaranTrendMap.has(key)) {
        pengeluaranTrendMap.set(key, (pengeluaranTrendMap.get(key) ?? 0) + p.jumlah);
      }
    }
    const tren6BulanPengeluaran = Array.from(pengeluaranTrendMap, ([bulan, pengeluaran]) => ({
      bulan,
      pengeluaran,
    }));

    // BEP Tracker — akumulasi laba SEPANJANG WAKTU (bukan hanya bulan
    // terpilih) dibanding total modal awal, supaya progress balik modal
    // konsisten terlepas dari bulan mana yang sedang dilihat di dropdown.
    const [semuaTransaksiLunas, semuaPengeluaran, semuaModalAwal, konfigurasi] = await Promise.all([
      prisma.transaksi.findMany({
        where: { statusBayar: "LUNAS" },
        include: { paket: true },
      }),
      prisma.pengeluaran.findMany(),
      prisma.modalAwal.findMany(),
      prisma.konfigurasiKeuangan.findFirst(),
    ]);

    const omzetSepanjangWaktu = semuaTransaksiLunas.reduce((sum, t) => sum + t.paket.harga, 0);
    const pengeluaranSepanjangWaktu = semuaPengeluaran.reduce((sum, p) => sum + p.jumlah, 0);
    const labaKumulatif = omzetSepanjangWaktu - pengeluaranSepanjangWaktu;

    const totalModalAwal = semuaModalAwal.reduce((sum, m) => sum + m.jumlah, 0);
    const targetModal =
      konfigurasi && konfigurasi.targetModalKembali > 0
        ? konfigurasi.targetModalKembali
        : totalModalAwal;

    const sudahKembali = Math.max(0, Math.min(labaKumulatif, targetModal));
    const sisaModal = Math.max(0, targetModal - sudahKembali);
    const progressPercent = targetModal > 0 ? Math.min(100, (sudahKembali / targetModal) * 100) : 0;

    // Rata-rata laba 3 bulan terakhir (dari tren6Bulan yang sudah dihitung)
    const laba6Bulan = tren6Bulan.map((t, i) => t.omzet - (tren6BulanPengeluaran[i]?.pengeluaran ?? 0));
    const laba3BulanTerakhir = laba6Bulan.slice(-3);
    const rataLaba3Bulan =
      laba3BulanTerakhir.length > 0
        ? laba3BulanTerakhir.reduce((sum, v) => sum + v, 0) / laba3BulanTerakhir.length
        : 0;
    const estimasiBulanBEP =
      sisaModal > 0 && rataLaba3Bulan > 0 ? Math.ceil(sisaModal / rataLaba3Bulan) : null;

    const bepTracker = {
      totalModalAwal: targetModal,
      sudahKembali,
      sisaModal,
      progressPercent,
      rataLaba3Bulan,
      estimasiBulanBEP,
      bepTercapai: targetModal === 0 || sudahKembali >= targetModal,
    };

    return NextResponse.json({
      bulan,
      omzetBulanIni,
      jumlahTransaksi,
      rataRataPerTransaksi,
      totalBelumDibayar,
      breakdownPaket,
      tren6Bulan,
      pengeluaranBulanIni,
      tren6BulanPengeluaran,
      bepTracker,
    });
  } catch (error) {
    console.error("[GET /api/admin/rekap]", error);
    return NextResponse.json({ error: "Gagal mengambil data rekap" }, { status: 500 });
  }
}
