import { NextResponse } from "next/server";
import { endOfWeek, startOfWeek } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { toUtcMidnightFromLocalDate } from "@/lib/date-utils";

type JenisLayanan = "jemput" | "antar";

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

    // Jemput dicek di tanggalMasuk, Antar dicek di tanggalJatuhTempo — satu
    // transaksi bisa punya salah satu atau kedua entry, jadi filter tanggal
    // di-OR-kan di kedua kolom lalu dipilah lagi per baris di bawah.
    const transaksiList = await prisma.transaksi.findMany({
      where: {
        armadaId: { not: null },
        OR: [{ layananJemput: true }, { layananAntar: true }],
        ...(tanggalFilter
          ? {
              OR: [
                { layananJemput: true, tanggalMasuk: tanggalFilter },
                { layananAntar: true, tanggalJatuhTempo: tanggalFilter },
              ],
            }
          : {}),
      },
      include: {
        pelanggan: true,
        armada: true,
        antarJemputOption: true,
      },
      orderBy: [{ tanggalMasuk: "asc" }],
    });

    const data = transaksiList.flatMap((t) => {
      const rows: {
        id: string;
        jenisLayanan: JenisLayanan;
        tanggal: Date;
        sesiWaktu: string | null;
        statusTransaksi: typeof t.statusTransaksi;
        pelanggan: { nama: string; alamatKos: string };
        armada: { nama: string } | null;
        antarJemputOption: { radiusLabel: string; label: string } | null;
        lokasiLat: number | null;
        lokasiLng: number | null;
      }[] = [];

      const dalamRange = (tanggal: Date) =>
        !tanggalFilter || (tanggal >= tanggalFilter.gte && tanggal <= tanggalFilter.lte);

      if (t.layananJemput && dalamRange(t.tanggalMasuk)) {
        rows.push({
          id: `${t.id}-jemput`,
          jenisLayanan: "jemput",
          tanggal: t.tanggalMasuk,
          sesiWaktu: t.sesiPenjemputan,
          statusTransaksi: t.statusTransaksi,
          pelanggan: t.pelanggan,
          armada: t.armada,
          antarJemputOption: t.antarJemputOption,
          lokasiLat: t.lokasiLat,
          lokasiLng: t.lokasiLng,
        });
      }

      if (t.layananAntar && dalamRange(t.tanggalJatuhTempo)) {
        rows.push({
          id: `${t.id}-antar`,
          jenisLayanan: "antar",
          tanggal: t.tanggalJatuhTempo,
          // Antar tidak punya kolom sesi tersendiri — armada yang sama
          // dipakai kedua arah, jadwal presisi dikoordinasikan admin.
          sesiWaktu: null,
          statusTransaksi: t.statusTransaksi,
          pelanggan: t.pelanggan,
          armada: t.armada,
          antarJemputOption: t.antarJemputOption,
          lokasiLat: t.lokasiLat,
          lokasiLng: t.lokasiLng,
        });
      }

      return rows;
    });

    data.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/admin/rekap-jadwal]", error);
    return NextResponse.json({ error: "Gagal mengambil rekap jadwal" }, { status: 500 });
  }
}
