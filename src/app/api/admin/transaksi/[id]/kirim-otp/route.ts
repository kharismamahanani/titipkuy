import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp, OTP_VALID_MS } from "@/lib/otp";
import { kodeTransaksi } from "@/lib/kode";
import { normalizeWhatsAppNumber } from "@/lib/utils";

// Middleware sudah menjamin route /api/admin/** hanya bisa diakses admin
// yang sudah login (lihat src/middleware.ts) — tidak perlu cek ulang di sini.
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id: params.id },
      include: { pelanggan: true },
    });

    if (!transaksi) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const kode = generateOtp();
    const berlakuHingga = new Date(Date.now() + OTP_VALID_MS);

    await prisma.otpPengambilan.create({
      data: {
        transaksiId: transaksi.id,
        kode,
        berlakuHingga,
      },
    });

    const pesan =
      `[TitipKuy!] Kode pengambilan barang ${kodeTransaksi(transaksi.nomorUrut)}: ${kode}. ` +
      `Berlaku 5 menit. Jangan bagikan ke siapapun.`;
    const nomorWa = normalizeWhatsAppNumber(transaksi.pelanggan.whatsapp);
    const waUrl = `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesan)}`;

    // Kirim WA otomatis butuh WhatsApp Business API (berbayar). Sebagai
    // alternatif gratis: OTP ditampilkan langsung di panel admin supaya
    // bisa dibacakan/ditunjukkan ke pelanggan, atau disalin dan dikirim
    // manual lewat link WA di atas.
    return NextResponse.json({ otp: kode, berlakuHingga, waUrl });
  } catch (error) {
    console.error("[POST /api/admin/transaksi/:id/kirim-otp]", error);
    return NextResponse.json({ error: "Gagal membuat kode OTP" }, { status: 500 });
  }
}
