import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const options = await prisma.antarJemputOption.findMany({
      orderBy: { urutan: "asc" },
    });
    return NextResponse.json(options);
  } catch (error) {
    console.error("[GET /api/admin/antar-jemput]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data antar-jemput" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      label,
      tipe,
      radiusLabel,
      hargaJemputSaja,
      hargaAntarSaja,
      hargaJemputDanAntar,
      kapasitasLabel,
      tipeArmada,
      aktif,
      urutan,
    } = body ?? {};

    if (
      !label ||
      !tipe ||
      !radiusLabel ||
      hargaJemputSaja == null ||
      hargaAntarSaja == null ||
      hargaJemputDanAntar == null
    ) {
      return NextResponse.json(
        { error: "Label, tipe, radius, dan ketiga harga layanan wajib diisi" },
        { status: 400 }
      );
    }

    const option = await prisma.antarJemputOption.create({
      data: {
        label,
        tipe,
        radiusLabel,
        harga: Number(hargaJemputSaja),
        hargaJemputSaja: Number(hargaJemputSaja),
        hargaAntarSaja: Number(hargaAntarSaja),
        hargaJemputDanAntar: Number(hargaJemputDanAntar),
        kapasitasLabel: kapasitasLabel || null,
        // Default ke `tipe` sendiri supaya otomatis cocok dengan Armada.tipe
        // untuk cek slot, kecuali admin secara eksplisit override.
        tipeArmada: tipeArmada || tipe,
        aktif: aktif ?? true,
        urutan: urutan != null ? Number(urutan) : 0,
      },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/antar-jemput]", error);
    return NextResponse.json(
      { error: "Gagal menambah opsi antar-jemput" },
      { status: 500 }
    );
  }
}
