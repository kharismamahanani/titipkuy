import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { KonfigurasiKeuanganSchema } from "@/lib/schemas";

async function getOrCreateSingleton() {
  const existing = await prisma.konfigurasiKeuangan.findFirst();
  if (existing) return existing;
  return prisma.konfigurasiKeuangan.create({ data: {} });
}

export async function GET() {
  try {
    const konfigurasi = await getOrCreateSingleton();
    return NextResponse.json(konfigurasi);
  } catch (error) {
    console.error("[GET /api/admin/konfigurasi-keuangan]", error);
    return NextResponse.json({ error: "Gagal mengambil konfigurasi keuangan" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = KonfigurasiKeuanganSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await getOrCreateSingleton();
    const konfigurasi = await prisma.konfigurasiKeuangan.update({
      where: { id: existing.id },
      data: parsed.data,
    });

    return NextResponse.json(konfigurasi);
  } catch (error) {
    console.error("[PUT /api/admin/konfigurasi-keuangan]", error);
    return NextResponse.json({ error: "Gagal menyimpan konfigurasi keuangan" }, { status: 500 });
  }
}
