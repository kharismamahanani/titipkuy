import { NextResponse } from "next/server";
import type { StatusBayar, StatusTransaksi } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hitungHargaPaketTertagih } from "@/lib/harga-paket";
import { terapkanDiskon } from "@/lib/voucher";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id: params.id },
      include: {
        pelanggan: true,
        paket: true,
        barangLabel: true,
        fotoMasuk: true,
        fotoKeluar: true,
      },
    });

    if (!transaksi) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(transaksi);
  } catch (error) {
    console.error("[GET /api/admin/transaksi/:id]", error);
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
    const {
      statusBayar,
      statusTransaksi,
      barangTibaMandiri,
      alasanPembatalan,
      tanggalMasuk,
      tanggalJatuhTempo,
      jumlahBarang,
    } = body ?? {};

    const data: {
      statusBayar?: StatusBayar;
      statusTransaksi?: StatusTransaksi;
      barangTibaMandiri?: boolean;
      alasanPembatalan?: string;
      tanggalMasuk?: Date;
      tanggalJatuhTempo?: Date;
      jumlahBarang?: number;
      hargaPaketTertagih?: number;
      hargaSebelumDiskon?: number | null;
    } = {};

    if (barangTibaMandiri !== undefined) {
      data.barangTibaMandiri = !!barangTibaMandiri;
    }

    if (tanggalMasuk !== undefined || tanggalJatuhTempo !== undefined || jumlahBarang !== undefined) {
      const current = await prisma.transaksi.findUnique({
        where: { id: params.id },
        include: { paket: true },
      });

      if (!current) {
        return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
      }

      const masukBaru = tanggalMasuk ? new Date(tanggalMasuk) : current.tanggalMasuk;
      const jatuhTempoBaru = tanggalJatuhTempo
        ? new Date(tanggalJatuhTempo)
        : current.tanggalJatuhTempo;
      const jumlahBarangBaru = jumlahBarang ?? current.jumlahBarang;

      if (jatuhTempoBaru <= masukBaru) {
        return NextResponse.json(
          { error: "Tanggal jatuh tempo harus setelah tanggal masuk" },
          { status: 400 }
        );
      }

      data.tanggalMasuk = masukBaru;
      data.tanggalJatuhTempo = jatuhTempoBaru;
      data.jumlahBarang = jumlahBarangBaru;

      const hargaAsli = hitungHargaPaketTertagih(current.paket, masukBaru, jatuhTempoBaru, jumlahBarangBaru);
      if (current.persenDiskonTerpakai != null) {
        data.hargaPaketTertagih = terapkanDiskon(hargaAsli, current.persenDiskonTerpakai);
        data.hargaSebelumDiskon = hargaAsli;
      } else {
        data.hargaPaketTertagih = hargaAsli;
      }
    }

    if (statusBayar !== undefined) {
      if (statusBayar !== "LUNAS" && statusBayar !== "BELUM_BAYAR") {
        return NextResponse.json(
          { error: "statusBayar tidak valid" },
          { status: 400 }
        );
      }
      data.statusBayar = statusBayar;
    }

    if (statusTransaksi !== undefined) {
      if (!["AKTIF", "SELESAI", "DIBATALKAN"].includes(statusTransaksi)) {
        return NextResponse.json(
          { error: "statusTransaksi tidak valid" },
          { status: 400 }
        );
      }

      if (statusTransaksi === "SELESAI") {
        const jumlahFotoKeluar = await prisma.fotoBarang.count({
          where: { transaksiKeluarId: params.id },
        });

        if (jumlahFotoKeluar === 0) {
          return NextResponse.json(
            { error: "Tambahkan minimal 1 foto keluar sebelum menandai selesai" },
            { status: 400 }
          );
        }
      }

      if (statusTransaksi === "DIBATALKAN") {
        const current = await prisma.transaksi.findUnique({
          where: { id: params.id },
          select: {
            statusTransaksi: true,
            statusBayar: true,
            fotoMasuk: { select: { id: true }, take: 1 },
          },
        });

        if (!current) {
          return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
        }

        const sudahMasukHub = current.fotoMasuk.length > 0;
        const bisaDibatalkan =
          current.statusTransaksi === "AKTIF" &&
          (current.statusBayar === "BELUM_BAYAR" || !sudahMasukHub);

        if (!bisaDibatalkan) {
          return NextResponse.json(
            {
              error:
                "Transaksi tidak bisa dibatalkan otomatis — barang sudah di hub dan sudah dibayar",
            },
            { status: 400 }
          );
        }

        if (!alasanPembatalan || !String(alasanPembatalan).trim()) {
          return NextResponse.json(
            { error: "Alasan pembatalan wajib diisi" },
            { status: 400 }
          );
        }

        data.alasanPembatalan = String(alasanPembatalan).trim();
      }

      data.statusTransaksi = statusTransaksi;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
    }

    const transaksi = await prisma.transaksi.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(transaksi);
  } catch (error) {
    console.error("[PATCH /api/admin/transaksi/:id]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui transaksi" },
      { status: 500 }
    );
  }
}
