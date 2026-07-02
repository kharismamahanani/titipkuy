"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CheckCircle2, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { PerjanjianPdfDocument } from "@/components/konfirmasi/perjanjian-pdf";
import { formatRupiah } from "@/lib/utils";
import { ADMIN_NAME, formatWhatsAppDisplay, getWhatsAppUrl } from "@/constants/site";
import { uploadToStorage } from "@/lib/supabase";
import type { TransaksiDetail } from "@/types/transaksi";

type FetchState = "loading" | "success" | "error";

export default function KonfirmasiPage({ params }: { params: { id: string } }) {
  const [transaksi, setTransaksi] = useState<TransaksiDetail | null>(null);
  const [state, setState] = useState<FetchState>("loading");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/transaksi/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Transaksi tidak ditemukan");
        return res.json();
      })
      .then((data: TransaksiDetail) => {
        if (isMounted) {
          setTransaksi(data);
          setState("success");
        }
      })
      .catch(() => {
        if (isMounted) setState("error");
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  async function handleDownloadPdf() {
    if (!transaksi) return;

    setIsGeneratingPdf(true);

    let blob: Blob;
    try {
      blob = await pdf(<PerjanjianPdfDocument transaksi={transaksi} />).toBlob();
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat PDF perjanjian, coba lagi");
      setIsGeneratingPdf(false);
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Perjanjian-${transaksi.nomorRef}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("PDF perjanjian berhasil diunduh");

    try {
      const file = new File([blob], `${transaksi.id}.pdf`, {
        type: "application/pdf",
      });
      const pdfUrl = await uploadToStorage(`perjanjian/${transaksi.id}.pdf`, file);

      await fetch(`/api/transaksi/${transaksi.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl }),
      });
    } catch (error) {
      console.error(error);
      toast.warning("PDF sudah diunduh, tapi gagal disimpan ke cloud");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  if (state === "loading") {
    return <CenteredMessage>Memuat data pesanan...</CenteredMessage>;
  }

  if (state === "error" || !transaksi) {
    return <CenteredMessage>Pesanan tidak ditemukan.</CenteredMessage>;
  }

  const { pelanggan, paket } = transaksi;
  const waMessage = `Halo TitipKuy! Saya sudah bayar order ${transaksi.nomorRef} a.n ${pelanggan.nama}. Bukti terlampir.`;

  return (
    <div className="min-h-screen bg-bg-dark px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <CheckCircle2
            className="mx-auto text-primary-from"
            size={72}
            strokeWidth={1.5}
          />
          <h1 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
            Pesanan Diterima! 🎉
          </h1>
        </div>

        <div className="text-center">
          <p className="text-sm text-foreground/60">Nomor Referensi</p>
          <p className="gradient-text font-heading text-3xl font-extrabold sm:text-4xl">
            {transaksi.nomorRef}
          </p>
        </div>

        <div className="glass-card space-y-2 rounded-2xl p-6 text-sm">
          <SummaryRow label="Nama" value={pelanggan.nama} />
          <SummaryRow label="Paket" value={paket.nama} />
          <SummaryRow label="Harga" value={formatRupiah(paket.harga)} />
          <SummaryRow
            label="Masuk"
            value={format(new Date(transaksi.tanggalMasuk), "d MMM yyyy", {
              locale: localeId,
            })}
          />
          <SummaryRow
            label="Jatuh tempo"
            value={format(new Date(transaksi.tanggalJatuhTempo), "d MMM yyyy", {
              locale: localeId,
            })}
          />
        </div>

        <div className="glass-card flex flex-col items-center gap-3 rounded-2xl p-6">
          <p className="text-sm font-medium">Scan QRIS untuk Bayar</p>
          <div className="rounded-xl bg-white p-4">
            <QRCodeSVG value={`TitipKuy-QRIS-${transaksi.nomorRef}`} size={180} />
          </div>
          <p className="text-center text-xs text-foreground/50">
            *QR code sementara — akan diganti QRIS asli
          </p>
        </div>

        <div className="glass-card space-y-3 rounded-2xl p-6 text-center">
          <p className="text-sm text-foreground/80">
            Transfer/scan QRIS lalu konfirmasi ke WA
          </p>
          <a
            href={getWhatsAppUrl(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full rounded-full bg-gradient-to-r from-primary-from to-primary-to px-6 py-3 text-sm font-semibold text-white"
          >
            Konfirmasi Pembayaran via WhatsApp
          </a>
          <p className="text-xs text-foreground/50">
            Admin: {ADMIN_NAME} &middot; {formatWhatsAppDisplay()}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isGeneratingPdf}
          onClick={handleDownloadPdf}
        >
          {isGeneratingPdf && <Loader2 className="animate-spin" size={16} />}
          Download PDF Perjanjian
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-foreground/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4 text-center text-foreground/70">
      {children}
    </div>
  );
}
