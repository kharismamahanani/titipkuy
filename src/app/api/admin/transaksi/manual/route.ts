import crypto from "crypto";
import { addDays } from "date-fns";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { incrementSlotUsage } from "@/lib/slot";
import { HUB_CONFIG } from "@/lib/constants";
import { TransaksiManualSchema } from "@/lib/schemas";

const MAX_NOMOR_REF_RETRY = 5;
const TOKEN_VALID_MS = 24 * 60 * 60 * 1000;

function generateNomorRef(hub: string) {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  const kode = HUB_CONFIG[hub as keyof typeof HUB_CONFIG]?.kode ?? HUB_CONFIG.suhat.kode;
  return `TK-${kode}-${yyyymm}-${random}`;
}

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

    for (let attempt = 0; attempt < MAX_NOMOR_REF_RETRY; attempt++) {
      try {
        const transaksi = await prisma.$transaction(async (tx) => {
          const created = await tx.transaksi.create({
            data: {
              id,
              nomorRef: generateNomorRef(hub),
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
          nomorRef: transaksi.nomorRef,
          token: konfirmasiToken,
        });
      } catch (error) {
        const isDuplicateNomorRef =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002";

        if (!isDuplicateNomorRef) throw error;
      }
    }

    return NextResponse.json(
      { error: "Gagal membuat nomor referensi, coba lagi" },
      { status: 500 }
    );
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
