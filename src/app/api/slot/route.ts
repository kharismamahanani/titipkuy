import { NextResponse } from "next/server";
import { getOrCreateKonfigurasi, parseTanggalMerah } from "@/lib/konfigurasi";
import { getSlotAvailability, incrementSlotUsage } from "@/lib/slot";
import { prisma } from "@/lib/prisma";
import { HUB_CONFIG } from "@/lib/constants";

const VALID_HUB = Object.keys(HUB_CONFIG);

// Tanpa query params: kembalikan info konfigurasi umum saja (dipakai untuk
// menonaktifkan tanggal di date picker sebelum hub/tanggal dipilih).
// Dengan ?tanggal=&hub=: kembalikan sisa slot per sesi untuk tanggal itu.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get("tanggal");
    const hub = searchParams.get("hub");

    if (!tanggal || !hub) {
      const konfig = await getOrCreateKonfigurasi();
      return NextResponse.json({
        lockH1: konfig.lockH1,
        lockHariMinggu: konfig.lockHariMinggu,
        tanggalMerah: parseTanggalMerah(konfig.lockTanggalMerah),
        pesanHariLibur: konfig.pesanHariLibur,
      });
    }

    if (!VALID_HUB.includes(hub)) {
      return NextResponse.json({ error: "Hub tidak valid" }, { status: 400 });
    }

    const data = await getSlotAvailability(tanggal, hub);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/slot]", error);
    return NextResponse.json({ error: "Gagal mengambil data slot" }, { status: 500 });
  }
}

// Endpoint internal — dipanggil server-to-server (dilindungi header
// x-internal-key). Alur pemesanan normal memanggil incrementSlotUsage()
// langsung dari POST /api/transaksi di dalam satu transaksi database,
// bukan lewat endpoint ini.
export async function POST(request: Request) {
  try {
    const internalKey = request.headers.get("x-internal-key");
    if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { armadaId, tanggal, sesiWaktu, hub } = body ?? {};

    if (!armadaId || !tanggal || !sesiWaktu || !hub) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    await incrementSlotUsage(prisma, { armadaId, tanggal, sesiWaktu, hub });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/slot]", error);
    const message = error instanceof Error && error.message === "SLOT_PENUH"
      ? "Slot sudah penuh"
      : "Gagal memperbarui slot";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
