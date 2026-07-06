import { addDays } from "date-fns";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { incrementSlotUsage } from "@/lib/slot";
import { bookingRatelimit, getClientIp } from "@/lib/rate-limit";
import { toUtcMidnightFromLocalDate } from "@/lib/date-utils";
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
      tierGantiRugi,
      premiGantiRugi,
      ktpUrl,
      stnkUrl,
      bpkbUrl,
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

    const isMotor = paket.kategori === "motor";

    const requiredChecklist = [
      "pengemasanWajib",
      "limitGantiRugi",
      "barangTerlarang",
      "jatuhTempo",
      "lepasSetelah30Hari",
    ] as const;
    const checklistOk = requiredChecklist.every((key) => checklist?.[key] === true);
    const deklarasiChecklistOk =
      !tierGantiRugi || tierGantiRugi === "standar" || checklist?.deklarasiBenar === true;
    const motorChecklistOk = !isMotor || checklist?.motorDeklarasiBenar === true;

    if (!checklistOk || !deklarasiChecklistOk || !motorChecklistOk) {
      return NextResponse.json(
        { error: "Semua persetujuan wajib dicentang" },
        { status: 400 }
      );
    }

    if (isMotor && (!ktpUrl || !stnkUrl)) {
      return NextResponse.json(
        { error: "KTP dan STNK wajib diupload untuk paket Titip Motor" },
        { status: 400 }
      );
    }

    let armadaTersediaId: string | null = null;

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
        // Dipakai untuk Rekap Jadwal Perjalanan di panel admin — flow
        // pelanggan tidak memilih sesi spesifik, jadi sesiPenjemputan
        // dibiarkan null dan tanggalPenjemputan mengikuti tanggalMasuk.
        armadaTersediaId = armadaTersedia.id;
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
              nilaiDeklarasi:
                tierGantiRugi && tierGantiRugi !== "standar" ? Number(nilaiDeklarasi) : null,
              deskripsiDeklarasi: deskripsiDeklarasi || null,
              buktiKepemilikanUrl: buktiKepemilikanUrl || null,
              tierGantiRugi: tierGantiRugi ?? "standar",
              premiGantiRugi: premiGantiRugi ?? 0,
              ktpUrl: isMotor ? ktpUrl : null,
              stnkUrl: isMotor ? stnkUrl : null,
              bpkbUrl: isMotor ? bpkbUrl || null : null,
              tanggalMasuk: tanggalMasukDate,
              tanggalJatuhTempo,
              metodePengiriman: metodePengiriman ?? null,
              antarJemputOption: antarJemputId
                ? { connect: { id: antarJemputId } }
                : undefined,
              armada: armadaTersediaId
                ? { connect: { id: armadaTersediaId } }
                : penjemputan
                  ? { connect: { id: penjemputan.armadaId } }
                  : undefined,
              tanggalPenjemputan: armadaTersediaId
                ? toUtcMidnightFromLocalDate(tanggalMasukDate)
                : penjemputan
                  ? new Date(penjemputan.tanggal)
                  : null,
              sesiPenjemputan: penjemputan ? penjemputan.sesiWaktu : null,
              perjanjianDisetujui: true,
              waktuPersetujuan: new Date(),
              ipAddress,
              userAgent,
              tandaTanganUrl,
              klausulLimitGantiRugi: true,
              klausulBarangTerlarang: true,
              klausulJatuhTempo: true,
              klausulDeklarasiNilai: tierGantiRugi !== "standar",
              // Foto kondisi barang sekarang diambil admin saat barang
              // benar-benar tiba di hub (lihat FotoKeluarUploader/foto
              // masuk di panel admin), bukan diupload pelanggan di sini.
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
