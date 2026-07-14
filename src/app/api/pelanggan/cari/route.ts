import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeWhatsapp } from "@/lib/whatsapp";
import { cekPesananRatelimit, getClientIp } from "@/lib/rate-limit";

// Endpoint publik — dipakai form pemesanan untuk auto-isi data pelanggan
// yang pernah titip sebelumnya (dicari berdasarkan No. WhatsApp), supaya
// tidak perlu mengetik ulang. Rate-limited karena mengembalikan nama &
// alamat hanya berdasarkan kecocokan nomor WA (tidak ada verifikasi
// kepemilikan nomor di titik ini).
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { success } = await cekPesananRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Terlalu banyak percobaan" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const whatsapp = searchParams.get("whatsapp")?.trim();
    if (!whatsapp) {
      return NextResponse.json({ error: "No WhatsApp wajib diisi" }, { status: 400 });
    }

    const normalized = normalizeWhatsapp(whatsapp);

    const pelanggan = await prisma.pelanggan.findFirst({
      where: { whatsapp: normalized },
      orderBy: { createdAt: "desc" },
      select: { nama: true, alamatKos: true, kampus: true, noKtpKtm: true },
    });

    if (!pelanggan) {
      return NextResponse.json({ error: "Belum pernah pesan" }, { status: 404 });
    }

    return NextResponse.json(pelanggan);
  } catch (error) {
    console.error("[GET /api/pelanggan/cari]", error);
    return NextResponse.json({ error: "Gagal mencari data pelanggan" }, { status: 500 });
  }
}
