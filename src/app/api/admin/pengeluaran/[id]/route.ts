import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.pengeluaran.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/pengeluaran/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus pengeluaran" }, { status: 500 });
  }
}
