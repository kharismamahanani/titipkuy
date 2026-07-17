import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VoucherSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const voucher = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(voucher);
  } catch (error) {
    console.error("[GET /api/admin/voucher]", error);
    return NextResponse.json({ error: "Gagal mengambil data voucher" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = VoucherSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { kode, persenDiskon, aktif, berlakuMulai, berlakuSampai, kuota, deskripsi } =
      parsed.data;

    const existing = await prisma.voucher.findUnique({ where: { kode: kode.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "Kode voucher sudah dipakai" }, { status: 400 });
    }

    const voucher = await prisma.voucher.create({
      data: {
        kode: kode.toUpperCase(),
        persenDiskon,
        aktif,
        berlakuMulai: berlakuMulai ? new Date(berlakuMulai) : null,
        berlakuSampai: berlakuSampai ? new Date(berlakuSampai) : null,
        kuota: kuota ?? null,
        deskripsi: deskripsi || null,
      },
    });

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/voucher]", error);
    return NextResponse.json({ error: "Gagal menambah voucher" }, { status: 500 });
  }
}
