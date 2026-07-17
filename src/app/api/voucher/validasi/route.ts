import { NextResponse } from "next/server";
import { validasiVoucher } from "@/lib/voucher";

// GET /api/voucher/validasi?kode=HEMAT10 — cek publik (read-only, tidak
// mengubah kuota) dipakai untuk preview diskon sebelum submit pemesanan.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kode = searchParams.get("kode");

  if (!kode) {
    return NextResponse.json({ error: "Kode voucher wajib diisi" }, { status: 400 });
  }

  const hasil = await validasiVoucher(kode);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.error }, { status: 400 });
  }

  return NextResponse.json({ persenDiskon: hasil.voucher.persenDiskon });
}
