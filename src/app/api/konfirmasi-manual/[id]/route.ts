import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REQUIRED_CHECKLIST = [
  "limitGantiRugi",
  "barangTerlarang",
  "jatuhTempo",
  "lepasSetelah30Hari",
] as const;

async function findValidTransaksi(id: string, token: string | null) {
  if (!token) return { error: "TOKEN_MISSING" as const };

  const transaksi = await prisma.transaksi.findFirst({
    where: { id, konfirmasiToken: token },
    include: { pelanggan: true, paket: true, fotoMasuk: true },
  });

  if (!transaksi) return { error: "NOT_FOUND" as const };

  if (
    !transaksi.konfirmasiTokenExpiresAt ||
    transaksi.konfirmasiTokenExpiresAt.getTime() < Date.now()
  ) {
    return { error: "EXPIRED" as const };
  }

  return { transaksi };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const result = await findValidTransaksi(params.id, token);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.error === "EXPIRED" ? 410 : 404 });
    }

    const { transaksi } = result;

    return NextResponse.json({
      ...transaksi,
      alreadyConfirmed: transaksi.perjanjianDisetujui,
    });
  } catch (error) {
    console.error("[GET /api/konfirmasi-manual/:id]", error);
    return NextResponse.json({ error: "Gagal mengambil data pesanan" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const result = await findValidTransaksi(params.id, token);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.error === "EXPIRED" ? 410 : 404 });
    }

    const { transaksi } = result;

    if (transaksi.perjanjianDisetujui) {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }

    const body = await request.json();
    const { checklist, tandaTanganUrl, fotoMasukUrls } = body ?? {};

    const checklistOk = REQUIRED_CHECKLIST.every((key) => checklist?.[key] === true);
    const deklarasiChecklistOk =
      !transaksi.paket.perluDeklarasi || checklist?.deklarasiBenar === true;

    if (!checklistOk || !deklarasiChecklistOk) {
      return NextResponse.json(
        { error: "Semua persetujuan wajib dicentang" },
        { status: 400 }
      );
    }

    if (!tandaTanganUrl) {
      return NextResponse.json(
        { error: "Tanda tangan digital wajib diisi" },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const updated = await prisma.transaksi.update({
      where: { id: transaksi.id },
      data: {
        perjanjianDisetujui: true,
        waktuPersetujuan: new Date(),
        ipAddress,
        userAgent,
        tandaTanganUrl,
        klausulLimitGantiRugi: true,
        klausulBarangTerlarang: true,
        klausulJatuhTempo: true,
        klausulDeklarasiNilai: transaksi.paket.perluDeklarasi,
        ...(Array.isArray(fotoMasukUrls) && fotoMasukUrls.length > 0
          ? {
              fotoMasuk: {
                create: fotoMasukUrls.map((url: string) => ({
                  url,
                  fileName: url.split("/").pop() ?? "foto.jpg",
                })),
              },
            }
          : {}),
      },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (error) {
    console.error("[PATCH /api/konfirmasi-manual/:id]", error);
    return NextResponse.json({ error: "Gagal menyimpan konfirmasi" }, { status: 500 });
  }
}
