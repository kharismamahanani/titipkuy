import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.modalAwal.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/modal-awal/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus modal awal" }, { status: 500 });
  }
}
