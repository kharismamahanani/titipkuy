import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseNomorUrutFromSearch } from "@/lib/kode";
import { normalizeWhatsapp } from "@/lib/whatsapp";
import { cekPesananRatelimit, getClientIp } from "@/lib/rate-limit";
import { CekPesananSchema } from "@/lib/schemas";
import type { CekPesananResult } from "@/types/transaksi";

const GENERIC_ERROR = "Kode transaksi atau No. WhatsApp tidak cocok. Periksa kembali.";

// Endpoint publik — pelanggan memasukkan kode transaksi (TK-XXXX) + No.
// WhatsApp yang dipakai saat pesan, tanpa perlu login. Kecocokan No.
// WhatsApp berfungsi sebagai bukti kepemilikan pesanan, jadi pesan error
// sengaja generik (tidak membedakan "kode salah" vs "WA salah") supaya
// endpoint ini tidak dipakai menebak-nebak nomor kode transaksi orang lain.
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { success } = await cekPesananRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = CekPesananSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { kodeTransaksi, whatsapp } = parsed.data;
    const nomorUrut = parseNomorUrutFromSearch(kodeTransaksi);
    if (nomorUrut === null) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
    }

    const transaksi = await prisma.transaksi.findUnique({
      where: { nomorUrut },
      select: {
        nomorUrut: true,
        statusTransaksi: true,
        statusBayar: true,
        tanggalMasuk: true,
        tanggalJatuhTempo: true,
        paket: { select: { nama: true, harga: true } },
        pelanggan: { select: { nama: true, whatsapp: true } },
        barangLabel: { select: { kodeLabel: true } },
      },
    });

    if (!transaksi || normalizeWhatsapp(transaksi.pelanggan.whatsapp) !== normalizeWhatsapp(whatsapp)) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
    }

    const result: CekPesananResult = {
      nama: transaksi.pelanggan.nama,
      paketNama: transaksi.paket.nama,
      hargaPaket: transaksi.paket.harga,
      statusTransaksi: transaksi.statusTransaksi,
      statusBayar: transaksi.statusBayar,
      tanggalMasuk: transaksi.tanggalMasuk.toISOString(),
      tanggalJatuhTempo: transaksi.tanggalJatuhTempo.toISOString(),
      nomorUrut: transaksi.nomorUrut,
      kodeLabel: transaksi.barangLabel.map((b) => b.kodeLabel),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/cek-pesanan]", error);
    return NextResponse.json({ error: "Gagal mengecek pesanan" }, { status: 500 });
  }
}
