import crypto from "crypto";
import { addDays } from "date-fns";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { incrementSlotUsage } from "@/lib/slot";
import { TransaksiManualSchema } from "@/lib/schemas";

const TOKEN_VALID_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = TransaksiManualSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      id,
      pelanggan,
      paketId,
      tanggalMasuk,
      tanggalJatuhTempo,
      hub,
      zonaRak,
      nilaiDeklarasi,
      deskripsiDeklarasi,
      buktiKepemilikanUrl,
      antarJemput,
      penjemputan,
      catatanAdmin,
    } = parsed.data;

    const paket = await prisma.paket.findUnique({ where: { id: paketId } });
    if (!paket || !paket.aktif) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 400 });
    }

    if (
      paket.perluDeklarasi &&
      (!nilaiDeklarasi || !buktiKepemilikanUrl || !deskripsiDeklarasi)
    ) {
      return NextResponse.json(
        { error: "Data deklarasi barang belum lengkap" },
        { status: 400 }
      );
    }

    if (antarJemput && !penjemputan) {
      return NextResponse.json(
        { error: "Data penjemputan tidak lengkap" },
        { status: 400 }
      );
    }

    const tanggalMasukDate = new Date(tanggalMasuk);
    const tanggalJatuhTempoDate = tanggalJatuhTempo
      ? new Date(tanggalJatuhTempo)
      : addDays(tanggalMasukDate, paket.durasiHari ?? 1);

    const existingPelanggan = await prisma.pelanggan.findFirst({
      where: { whatsapp: pelanggan.whatsapp },
    });

    const konfirmasiToken = crypto.randomBytes(24).toString("hex");
    const konfirmasiTokenExpiresAt = new Date(Date.now() + TOKEN_VALID_MS);

    const transaksi = await prisma.$transaction(async (tx) => {
      const created = await tx.transaksi.create({
        data: {
          id,
          pelanggan: existingPelanggan
            ? { connect: { id: existingPelanggan.id } }
            : {
                create: {
                  nama: pelanggan.nama,
                  whatsapp: pelanggan.whatsapp,
                  alamatKos: pelanggan.alamatKos || "",
                  kampus: pelanggan.kampus || null,
                  noKtpKtm: pelanggan.noKtpKtm || null,
                },
              },
          paket: { connect: { id: paket.id } },
          nilaiDeklarasi: paket.perluDeklarasi ? Number(nilaiDeklarasi) : null,
          deskripsiDeklarasi: paket.perluDeklarasi ? deskripsiDeklarasi : null,
          buktiKepemilikanUrl: paket.perluDeklarasi ? buktiKepemilikanUrl : null,
          tanggalMasuk: tanggalMasukDate,
          tanggalJatuhTempo: tanggalJatuhTempoDate,
          hub,
          zonaRak: zonaRak || null,
          catatanAdmin: catatanAdmin || null,
          armada:
            antarJemput && penjemputan
              ? { connect: { id: penjemputan.armadaId } }
              : undefined,
          tanggalPenjemputan:
            antarJemput && penjemputan ? new Date(penjemputan.tanggal) : null,
          sesiPenjemputan: antarJemput && penjemputan ? penjemputan.sesiWaktu : null,
          konfirmasiToken,
          konfirmasiTokenExpiresAt,
        },
      });

      if (antarJemput && penjemputan) {
        await incrementSlotUsage(tx, {
          armadaId: penjemputan.armadaId,
          tanggal: penjemputan.tanggal,
          sesiWaktu: penjemputan.sesiWaktu,
          hub: penjemputan.hub,
        });
      }

      return created;
    });

    return NextResponse.json({
      id: transaksi.id,
      nomorUrut: transaksi.nomorUrut,
      token: konfirmasiToken,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_PENUH") {
      return NextResponse.json(
        { error: "Slot yang dipilih baru saja penuh, pilih jadwal lain." },
        { status: 409 }
      );
    }
    console.error("[POST /api/admin/transaksi/manual]", error);
    return NextResponse.json({ error: "Gagal membuat order manual" }, { status: 500 });
  }
}
