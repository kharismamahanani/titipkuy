import { addDays, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cariSesiTersedia, incrementSlotUsage } from "@/lib/slot";
import { bookingRatelimit, getClientIp } from "@/lib/rate-limit";
import { toUtcMidnightFromLocalDate } from "@/lib/date-utils";
import { AKTIF_HUB_KEYS } from "@/lib/constants";
import { TransaksiSchema } from "@/lib/schemas";

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
      layananJemput: layananJemputInput,
      layananAntar: layananAntarInput,
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

    // Normalisasi ke UTC midnight dari tanggal kalender WIB yang dipilih
    // pelanggan (lihat komentar di date-utils.ts) — tanpa ini, instant yang
    // tersimpan bisa jatuh sehari lebih awal saat diformat di server yang
    // berjalan di UTC (mis. Vercel), padahal benar saat diformat di browser
    // WIB. Konsisten dengan tanggalPenjemputan yang sudah dinormalisasi.
    const tanggalMasukDate = toUtcMidnightFromLocalDate(new Date(tanggalMasuk));
    const tanggalJatuhTempo = addDays(tanggalMasukDate, paket.durasiHari ?? 1);
    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    let armadaTersediaId: string | null = null;
    let layananJemput = false;
    let layananAntar = false;
    let jemputSlot: { armadaId: string; sesiWaktu: string; tanggal: Date } | null = null;
    let antarSlot: { armadaId: string; sesiWaktu: string; tanggal: Date } | null = null;

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

      // Default ke Jemput Saja untuk kompatibilitas dengan klien lama yang
      // hanya mengirim antarJemputId tanpa flag layanan.
      layananJemput = layananJemputInput ?? !layananAntarInput;
      layananAntar = layananAntarInput ?? false;

      // AntarJemputOption menyimpan harga & pilihan untuk pelanggan, tapi
      // ketersediaan armadanya tetap dikelola lewat tabel Armada + SlotArmada
      // (tipeArmada mencocokkan AntarJemputOption.tipeArmada dengan
      // Armada.tipe). Hub belum dipilih pelanggan di alur ini, jadi dicek
      // terhadap hub aktif (saat ini hanya satu hub yang beroperasi).
      const hubUntukCekSlot = AKTIF_HUB_KEYS[0];
      const tipeArmada = antarJemputOption.tipeArmada as "motor" | "mobil" | null;

      if (tipeArmada && hubUntukCekSlot) {
        if (layananJemput) {
          const found = await cariSesiTersedia(
            format(tanggalMasukDate, "yyyy-MM-dd"),
            hubUntukCekSlot,
            tipeArmada
          );
          if (!found) {
            return NextResponse.json(
              {
                error: `Armada penuh untuk tanggal penjemputan (${format(tanggalMasukDate, "d MMMM yyyy", { locale: localeId })}). Pilih armada lain atau ambil sendiri ke Hub.`,
              },
              { status: 409 }
            );
          }
          jemputSlot = { ...found, tanggal: tanggalMasukDate };
          armadaTersediaId = found.armadaId;
        }

        if (layananAntar) {
          const found = await cariSesiTersedia(
            format(tanggalJatuhTempo, "yyyy-MM-dd"),
            hubUntukCekSlot,
            tipeArmada
          );
          if (!found) {
            return NextResponse.json(
              {
                error: `Armada penuh untuk tanggal pengantaran (${format(tanggalJatuhTempo, "d MMMM yyyy", { locale: localeId })}). Pilih armada lain atau ambil sendiri ke Hub.`,
              },
              { status: 409 }
            );
          }
          antarSlot = { ...found, tanggal: tanggalJatuhTempo };
          armadaTersediaId = armadaTersediaId ?? found.armadaId;
        }

        if (!jemputSlot && !antarSlot) {
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

    const transaksi = await prisma.$transaction(async (tx) => {
      const created = await tx.transaksi.create({
        data: {
          id,
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
          layananJemput,
          layananAntar,
          antarJemputOption: antarJemputId
            ? { connect: { id: antarJemputId } }
            : undefined,
          armada: armadaTersediaId
            ? { connect: { id: armadaTersediaId } }
            : penjemputan
              ? { connect: { id: penjemputan.armadaId } }
              : undefined,
          tanggalPenjemputan: penjemputan
            ? new Date(penjemputan.tanggal)
            : jemputSlot
              ? toUtcMidnightFromLocalDate(tanggalMasukDate)
              : null,
          sesiPenjemputan: penjemputan ? penjemputan.sesiWaktu : jemputSlot?.sesiWaktu ?? null,
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

      const hubUntukSlot = AKTIF_HUB_KEYS[0];
      if (jemputSlot && hubUntukSlot) {
        await incrementSlotUsage(tx, {
          armadaId: jemputSlot.armadaId,
          tanggal: format(jemputSlot.tanggal, "yyyy-MM-dd"),
          sesiWaktu: jemputSlot.sesiWaktu,
          hub: hubUntukSlot,
        });
      }
      if (antarSlot && hubUntukSlot) {
        await incrementSlotUsage(tx, {
          armadaId: antarSlot.armadaId,
          tanggal: format(antarSlot.tanggal, "yyyy-MM-dd"),
          sesiWaktu: antarSlot.sesiWaktu,
          hub: hubUntukSlot,
        });
      }

      return created;
    });

    return NextResponse.json({ id: transaksi.id, nomorUrut: transaksi.nomorUrut });
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
