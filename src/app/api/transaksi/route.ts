import { addDays } from "date-fns";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { incrementSlotUsage } from "@/lib/slot";
import { bookingRatelimit, getClientIp } from "@/lib/rate-limit";
import { HUB_CONFIG } from "@/lib/constants";
import { TransaksiSchema } from "@/lib/schemas";

const MAX_NOMOR_REF_RETRY = 5;

function generateNomorRef() {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TK-${HUB_CONFIG.suhat.kode}-${yyyymm}-${random}`;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { success } = await bookingRatelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Maksimal 3 pesanan per jam dari alamat yang sama. Coba lagi nanti atau hubungi kami via WhatsApp.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = TransaksiSchema.safeParse(body);

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
      nilaiDeklarasi,
      deskripsiDeklarasi,
      buktiKepemilikanUrl,
      fotoMasukUrls,
      tandaTanganUrl,
      checklist,
      penjemputan,
      metodePengiriman,
      antarJemputId,
    } = parsed.data;

    const paket = await prisma.paket.findUnique({ where: { id: paketId } });
    if (!paket || !paket.aktif) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 400 });
    }

    const requiredChecklist = [
      "limitGantiRugi",
      "barangTerlarang",
      "jatuhTempo",
      "lepasSetelah30Hari",
    ] as const;
    const checklistOk = requiredChecklist.every((key) => checklist?.[key] === true);
    const deklarasiChecklistOk =
      !paket.perluDeklarasi || checklist?.deklarasiBenar === true;

    if (!checklistOk || !deklarasiChecklistOk) {
      return NextResponse.json(
        { error: "Semua persetujuan wajib dicentang" },
        { status: 400 }
      );
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

    if (antarJemputId) {
      const antarJemputOption = await prisma.antarJemputOption.findUnique({
        where: { id: antarJemputId },
      });
      if (!antarJemputOption || !antarJemputOption.aktif) {
        return NextResponse.json(
          { error: "Opsi antar-jemput tidak valid" },
          { status: 400 }
        );
      }

      // AntarJemputOption menyimpan harga & pilihan untuk pelanggan, tapi
      // ketersediaan armadanya tetap dikelola lewat tabel Armada (tipeArmada
      // mencocokkan AntarJemputOption.tipeArmada dengan Armada.tipe).
      if (antarJemputOption.tipeArmada) {
        const armadaTersedia = await prisma.armada.findFirst({
          where: { tipe: antarJemputOption.tipeArmada, aktif: true },
        });
        if (!armadaTersedia) {
          return NextResponse.json(
            {
              error:
                "Armada untuk opsi antar-jemput ini sedang tidak tersedia. Hubungi admin via WhatsApp.",
            },
            { status: 409 }
          );
        }
      }
    }

    const tanggalMasukDate = new Date(tanggalMasuk);
    const tanggalJatuhTempo = addDays(tanggalMasukDate, paket.durasiHari ?? 1);
    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    for (let attempt = 0; attempt < MAX_NOMOR_REF_RETRY; attempt++) {
      try {
        const transaksi = await prisma.$transaction(async (tx) => {
          const created = await tx.transaksi.create({
            data: {
              id,
              nomorRef: generateNomorRef(),
              pelanggan: {
                create: {
                  nama: pelanggan.nama,
                  whatsapp: pelanggan.whatsapp,
                  alamatKos: pelanggan.alamatKos,
                  kampus: pelanggan.kampus || null,
                  noKtpKtm: pelanggan.noKtpKtm || null,
                },
              },
              paket: {
                connect: { id: paket.id },
              },
              nilaiDeklarasi: paket.perluDeklarasi ? Number(nilaiDeklarasi) : null,
              deskripsiDeklarasi: paket.perluDeklarasi ? deskripsiDeklarasi : null,
              buktiKepemilikanUrl: paket.perluDeklarasi ? buktiKepemilikanUrl : null,
              tanggalMasuk: tanggalMasukDate,
              tanggalJatuhTempo,
              metodePengiriman: metodePengiriman ?? null,
              antarJemputOption: antarJemputId
                ? { connect: { id: antarJemputId } }
                : undefined,
              perjanjianDisetujui: true,
              waktuPersetujuan: new Date(),
              ipAddress,
              userAgent,
              tandaTanganUrl,
              klausulLimitGantiRugi: true,
              klausulBarangTerlarang: true,
              klausulJatuhTempo: true,
              klausulDeklarasiNilai: paket.perluDeklarasi,
              fotoMasuk: {
                create: fotoMasukUrls.map((url: string) => ({
                  url,
                  fileName: url.split("/").pop() ?? "foto.jpg",
                })),
              },
            },
          });

          if (penjemputan) {
            await incrementSlotUsage(tx, {
              armadaId: penjemputan.armadaId,
              tanggal: penjemputan.tanggal,
              sesiWaktu: penjemputan.sesiWaktu,
              hub: penjemputan.hub,
            });
          }

          return created;
        });

        return NextResponse.json({ id: transaksi.id, nomorRef: transaksi.nomorRef });
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
        { error: "Slot yang kamu pilih baru saja penuh, silakan pilih jadwal lain." },
        { status: 409 }
      );
    }
    console.error("[POST /api/transaksi]", error);
    return NextResponse.json({ error: "Gagal menyimpan pesanan" }, { status: 500 });
  }
}
