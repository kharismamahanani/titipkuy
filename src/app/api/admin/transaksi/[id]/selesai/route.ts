import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, hashCredentials } from "@/lib/admin-auth";

async function isAdminAuthenticated() {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return false;

  const expectedHash = await hashCredentials(
    process.env.ADMIN_USERNAME ?? "",
    process.env.ADMIN_PASSWORD ?? ""
  );
  return sessionCookie === expectedHash;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
    }

    const body = await request.json();
    const { fotoKeluarUrls } = body ?? {};

    if (!Array.isArray(fotoKeluarUrls) || fotoKeluarUrls.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 foto kondisi barang wajib diupload" },
        { status: 400 }
      );
    }

    const transaksi = await prisma.transaksi.findUnique({ where: { id: params.id } });
    if (!transaksi) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.fotoBarang.createMany({
        data: fotoKeluarUrls.map((url: string) => ({
          transaksiKeluarId: params.id,
          url,
          fileName: url.split("/").pop() ?? "foto.jpg",
        })),
      }),
      prisma.transaksi.update({
        where: { id: params.id },
        data: {
          statusTransaksi: "SELESAI",
          statusBayar: "LUNAS",
        },
      }),
    ]);

    return NextResponse.json({ success: true, transaksiId: params.id });
  } catch (error) {
    console.error("[POST /api/admin/transaksi/:id/selesai]", error);
    return NextResponse.json(
      { error: "Gagal menyelesaikan transaksi" },
      { status: 500 }
    );
  }
}
