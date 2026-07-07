import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { uploadToStorage } from "@/lib/supabase";
import { PerjanjianPdfDocument } from "@/components/konfirmasi/perjanjian-pdf";
import type { TransaksiDetail } from "@/types/transaksi";

// Generate ulang PDF pernyataan kesediaan di server — dipakai sebagai
// fallback untuk transaksi lama yang pdfUrl-nya kosong (mis. pelanggan
// tidak sempat klik "Download PDF Pernyataan" di halaman konfirmasi, atau
// generate otomatis di konfirmasi-manual gagal diam-diam).
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id: params.id },
      include: { pelanggan: true, paket: true, antarJemputOption: true },
    });

    if (!transaksi) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const detail: TransaksiDetail = {
      id: transaksi.id,
      nomorUrut: transaksi.nomorUrut,
      pelanggan: {
        ...transaksi.pelanggan,
        createdAt: transaksi.pelanggan.createdAt.toISOString(),
      },
      paket: {
        ...transaksi.paket,
        createdAt: transaksi.paket.createdAt.toISOString(),
        updatedAt: transaksi.paket.updatedAt.toISOString(),
      },
      nilaiDeklarasi: transaksi.nilaiDeklarasi,
      deskripsiDeklarasi: transaksi.deskripsiDeklarasi,
      buktiKepemilikanUrl: transaksi.buktiKepemilikanUrl,
      tierGantiRugi: transaksi.tierGantiRugi,
      premiGantiRugi: transaksi.premiGantiRugi,
      ktpUrl: transaksi.ktpUrl,
      stnkUrl: transaksi.stnkUrl,
      bpkbUrl: transaksi.bpkbUrl,
      tanggalMasuk: transaksi.tanggalMasuk.toISOString(),
      tanggalJatuhTempo: transaksi.tanggalJatuhTempo.toISOString(),
      statusBayar: transaksi.statusBayar,
      statusTransaksi: transaksi.statusTransaksi,
      hub: transaksi.hub,
      metodePengiriman: transaksi.metodePengiriman as "armada" | "mandiri" | null,
      barangTibaMandiri: transaksi.barangTibaMandiri,
      antarJemputOption: transaksi.antarJemputOption,
      tandaTanganUrl: transaksi.tandaTanganUrl,
      pdfUrl: transaksi.pdfUrl,
      createdAt: transaksi.createdAt.toISOString(),
    };

    const buffer = await renderToBuffer(<PerjanjianPdfDocument transaksi={detail} />);
    const pdfFile = new File([new Uint8Array(buffer)], `${transaksi.id}.pdf`, {
      type: "application/pdf",
    });
    const pdfUrl = await uploadToStorage(`perjanjian/${transaksi.id}.pdf`, pdfFile);

    await prisma.transaksi.update({
      where: { id: transaksi.id },
      data: { pdfUrl },
    });

    return NextResponse.json({ pdfUrl });
  } catch (error) {
    console.error("[POST /api/admin/transaksi/:id/generate-pdf]", error);
    return NextResponse.json({ error: "Gagal membuat PDF pernyataan" }, { status: 500 });
  }
}
