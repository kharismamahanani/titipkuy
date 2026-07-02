import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFromStorage, getStoragePathFromUrl } from "@/lib/supabase";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const foto = await prisma.fotoBarang.findUnique({ where: { id: params.id } });

    if (!foto) {
      return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
    }

    const path = getStoragePathFromUrl(foto.url);
    if (path) {
      try {
        await deleteFromStorage(path);
      } catch (error) {
        console.error("[DELETE /api/admin/foto/:id] storage", error);
      }
    }

    await prisma.fotoBarang.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/foto/:id]", error);
    return NextResponse.json({ error: "Gagal menghapus foto" }, { status: 500 });
  }
}
