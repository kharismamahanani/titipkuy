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
    const { urls } = body ?? {};

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Tidak ada foto untuk disimpan" }, { status: 400 });
    }

    const fotos = await prisma.$transaction(
      urls.map((url: string) =>
        prisma.fotoBarang.create({
          data: {
            transaksiMasukId: params.id,
            url,
            fileName: url.split("/").pop() ?? "foto.jpg",
          },
        })
      )
    );

    return NextResponse.json({ ok: true, fotos });
  } catch (error) {
    console.error("[POST /api/admin/transaksi/:id/foto-masuk]", error);
    return NextResponse.json({ error: "Gagal menyimpan foto masuk" }, { status: 500 });
  }
}
