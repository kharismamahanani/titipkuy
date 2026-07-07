import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const kode = String(body?.kode ?? "").trim();

    if (!kode) {
      return NextResponse.json(
        { valid: false, alasan: "Kode OTP wajib diisi" },
        { status: 400 }
      );
    }

    const otpTerbaru = await prisma.otpPengambilan.findFirst({
      where: { transaksiId: params.id },
      orderBy: { createdAt: "desc" },
    });

    if (!otpTerbaru) {
      return NextResponse.json({
        valid: false,
        alasan: "Belum ada OTP yang dikirim untuk transaksi ini",
      });
    }

    if (otpTerbaru.sudahDipakai) {
      return NextResponse.json({
        valid: false,
        alasan: "OTP ini sudah pernah dipakai, kirim OTP baru",
      });
    }

    if (otpTerbaru.berlakuHingga.getTime() < Date.now()) {
      return NextResponse.json({
        valid: false,
        alasan: "OTP sudah kadaluarsa, kirim OTP baru",
      });
    }

    if (otpTerbaru.kode !== kode) {
      return NextResponse.json({ valid: false, alasan: "Kode OTP salah" });
    }

    await prisma.otpPengambilan.update({
      where: { id: otpTerbaru.id },
      data: { sudahDipakai: true },
    });

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[POST /api/admin/transaksi/:id/verifikasi-otp]", error);
    return NextResponse.json(
      { valid: false, alasan: "Gagal memverifikasi OTP" },
      { status: 500 }
    );
  }
}
