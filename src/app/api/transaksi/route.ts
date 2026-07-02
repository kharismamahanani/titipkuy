import { addDays } from "date-fns";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { incrementSlotUsage } from "@/lib/slot";
import { getClientIp, isRateLimited, recordAttempt } from "@/lib/rate-limit";

const HUB_CODE = "B";
const MAX_NOMOR_REF_RETRY = 5;
const VALID_HUB = ["suhat", "tidar"];
const VALID_SESI = ["pagi", "siang"];
const MAX_TRANSAKSI_PER_JAM = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function generateNomorRef() {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TK-${HUB_CODE}-${yyyymm}-${random}`;
}

export async function POST(request: Request) {
  try {
    const rateLimitKey = `transaksi:${getClientIp(request)}`;

    if (isRateLimited(rateLimitKey, MAX_TRANSAKSI_PER_JAM, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        {
          error: `Maksimal ${MAX_TRANSAKSI_PER_JAM} pesanan per jam dari alamat yang sama. Coba lagi nanti atau hubungi kami via WhatsApp.`,
        },
        { status: 429 }
      );
    }
    recordAttempt(rateLimitKey, RATE_LIMIT_WINDOW_MS);

    const body = await request.json();
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
    } = body ?? {};

    if (
      !id ||
      !pelanggan?.nama ||
      !pelanggan?.whatsapp ||
      !pelanggan?.alamatKos ||
      !paketId ||
      !tanggalMasuk ||
      !tandaTanganUrl ||
      !Array.isArray(fotoMasukUrls) ||
      fotoMasukUrls.length < 3
    ) {
      return NextResponse.json(
        { error: "Data pemesanan tidak lengkap" },
        { status: 400 }
      );
    }

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

    if (
      penjemputan &&
      (!VALID_HUB.includes(penjemputan.hub) ||
        !VALID_SESI.includes(penjemputan.sesiWaktu) ||
        !penjemputan.armadaId ||
        !penjemputan.tanggal)
    ) {
      return NextResponse.json(
        { error: "Data penjemputan tidak lengkap" },
        { status: 400 }
      );
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
