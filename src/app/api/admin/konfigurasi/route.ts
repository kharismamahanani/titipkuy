import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateKonfigurasi, parseTanggalMerah } from "@/lib/konfigurasi";

function serialize(config: {
  id: string;
  lockH1: boolean;
  lockHariMinggu: boolean;
  lockTanggalMerah: string;
  pesanHariLibur: string;
  updatedAt: Date;
}) {
  return {
    id: config.id,
    lockH1: config.lockH1,
    lockHariMinggu: config.lockHariMinggu,
    tanggalMerah: parseTanggalMerah(config.lockTanggalMerah),
    pesanHariLibur: config.pesanHariLibur,
    updatedAt: config.updatedAt,
  };
}

export async function GET() {
  try {
    const config = await getOrCreateKonfigurasi();
    return NextResponse.json(serialize(config));
  } catch (error) {
    console.error("[GET /api/admin/konfigurasi]", error);
    return NextResponse.json({ error: "Gagal mengambil konfigurasi" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { lockH1, lockHariMinggu, tanggalMerah, pesanHariLibur } = body ?? {};

    if (!Array.isArray(tanggalMerah)) {
      return NextResponse.json({ error: "tanggalMerah harus berupa array" }, { status: 400 });
    }

    const existing = await getOrCreateKonfigurasi();

    const updated = await prisma.konfigurasiOperasional.update({
      where: { id: existing.id },
      data: {
        lockH1: !!lockH1,
        lockHariMinggu: !!lockHariMinggu,
        lockTanggalMerah: JSON.stringify(tanggalMerah),
        pesanHariLibur: pesanHariLibur || existing.pesanHariLibur,
      },
    });

    return NextResponse.json(serialize(updated));
  } catch (error) {
    console.error("[PUT /api/admin/konfigurasi]", error);
    return NextResponse.json({ error: "Gagal menyimpan konfigurasi" }, { status: 500 });
  }
}
