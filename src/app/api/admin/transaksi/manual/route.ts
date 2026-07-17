import crypto from "crypto";
import { addDays } from "date-fns";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { incrementSlotUsage } from "@/lib/slot";
import { toUtcMidnightFromLocalDate } from "@/lib/date-utils";
import { hitungHargaPaketTertagih } from "@/lib/harga-paket";
import { validasiVoucher, terapkanDiskon } from "@/lib/voucher";
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
      kodeVoucher,
    } = parsed.data;

    const paket = await prisma.paket.findUnique({ where: { id: paketId } });
    if (!paket || !paket.aktif) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 400 });
    }

    let voucherValid: { id: string; kode: string; persenDiskon: number } | null = null;
    if (kodeVoucher) {
      const hasil = await validasiVoucher(kodeVoucher);
      if (!hasil.ok) {
        return NextResponse.json({ error: hasil.error }, { status: 400 });
      }
      voucherValid = hasil.voucher;
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

    // Normalisasi ke UTC midnight — lihat komentar di date-utils.ts dan
    // /api/transaksi/route.ts. Tanpa ini, format tanggal di halaman admin
    // (server, biasanya UTC) bisa mundur sehari dibanding tanggal kalender
    // WIB yang sebenarnya dipilih.
    const tanggalMasukDate = toUtcMidnightFromLocalDate(new Date(tanggalMasuk));
    const tanggalJatuhTempoDate = tanggalJatuhTempo
      ? toUtcMidnightFromLocalDate(new Date(tanggalJatuhTempo))
      : addDays(tanggalMasukDate, paket.durasiHari ?? 1);

    const existingPelanggan = await prisma.pelanggan.findFirst({
      where: { whatsapp: pelanggan.whatsapp },
    });

    const konfirmasiToken = crypto.randomBytes(24).toString("hex");
    const konfirmasiTokenExpiresAt = new Date(Date.now() + TOKEN_VALID_MS);

    const hargaAsli = hitungHargaPaketTertagih(paket, tanggalMasukDate, tanggalJatuhTempoDate);
    const hargaTertagih = voucherValid ? terapkanDiskon(hargaAsli, voucherValid.persenDiskon) : hargaAsli;

    const transaksi = await prisma.$transaction(async (tx) => {
      // Kuota voucher dicek ulang & di-increment dalam transaksi DB yang sama
      // supaya dua order bersamaan tidak sama-sama lolos saat kuota tersisa 1.
      if (voucherValid) {
        const current = await tx.voucher.findUnique({ where: { id: voucherValid.id } });
        if (!current || !current.aktif || (current.kuota !== null && current.terpakai >= current.kuota)) {
          throw new Error("VOUCHER_KUOTA_HABIS");
        }
        await tx.voucher.update({
          where: { id: voucherValid.id },
          data: { terpakai: { increment: 1 } },
        });
      }

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
          hargaPaketTertagih: hargaTertagih,
          voucher: voucherValid ? { connect: { id: voucherValid.id } } : undefined,
          hargaSebelumDiskon: voucherValid ? hargaAsli : null,
          persenDiskonTerpakai: voucherValid ? voucherValid.persenDiskon : null,
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
    if (error instanceof Error && error.message === "VOUCHER_KUOTA_HABIS") {
      return NextResponse.json(
        { error: "Kuota kode voucher baru saja habis." },
        { status: 409 }
      );
    }
    console.error("[POST /api/admin/transaksi/manual]", error);
    return NextResponse.json({ error: "Gagal membuat order manual" }, { status: 500 });
  }
}
