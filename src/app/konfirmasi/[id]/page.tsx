"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Image from "next/image";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { TkButton, tkButtonVariants } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { PerjanjianPdfDocument } from "@/components/konfirmasi/perjanjian-pdf";
import { cn, formatRupiah } from "@/lib/utils";
import { ADMIN_NAME, formatWhatsAppDisplay, getWhatsAppUrl } from "@/constants/site";
import { uploadToStorage } from "@/lib/supabase";
import { HUB_CONFIG, JAM_DROP_OFF_MANDIRI, generateKodeUnik } from "@/lib/constants";
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
  const kodeUnik = generateKodeUnik(transaksi.nomorUrut);

  function handleCopyKode() {
    navigator.clipboard
      .writeText(kodeUnik)
      .then(() => toast.success("Kode disalin!"))
      .catch(() => toast.error("Gagal menyalin kode"));
  }

  return (
    <div className="min-h-screen bg-tk-cream px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-xl space-y-6">
        <TkCard variant="orange" className="text-center">
          <p className="text-[13px] font-bold text-tk-charcoal">Kode Unik Barangmu</p>
          <p className="mt-2 text-[36px] font-extrabold leading-tight text-tk-charcoal">
            {kodeUnik}
          </p>
          <TkButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyKode}
            className="mt-3"
          >
            <Copy size={14} className="mr-1.5" />
            Salin kode
          </TkButton>
          <p className="mt-3 text-xs text-tk-charcoal">
            Tulis kode ini di luar kardus/koper
          </p>
        </TkCard>

        {transaksi.metodePengiriman === "mandiri" && (
          <TkCard className="space-y-3 text-sm text-tk-charcoal">
            <p>
              📦 Kamu memilih kirim sendiri / via Grab/Lalamove
              <br />
              Jam drop-off ke Hub Suhat: {JAM_DROP_OFF_MANDIRI}
              <br />
              Alamat: {HUB_CONFIG.suhat.alamat}, Malang
            </p>
            <a
              href={getWhatsAppUrl(
                `Halo TitipKuy! Saya sudah/akan kirim barang dengan Kode Unik ${kodeUnik} a.n ${pelanggan.nama}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border-2 border-tk-charcoal py-2 text-center text-sm font-bold text-tk-charcoal hover:bg-tk-cream-alt"
            >
              Beritahu Admin via WA
            </a>
          </TkCard>
        )}

        <div className="text-center">
          <CheckCircle2 className="mx-auto text-tk-sage-dark" size={72} strokeWidth={1.5} />
          <h1 className="mt-4 text-2xl font-extrabold text-tk-charcoal sm:text-3xl">
            Pesanan Diterima! 🎉
          </h1>
        </div>

        <div className="text-center">
          <p className="text-sm text-tk-muted">Nomor Referensi</p>
          <p className="text-3xl font-extrabold text-tk-orange sm:text-4xl">
            {transaksi.nomorRef}
          </p>
        </div>

        <TkCard className="space-y-2 text-sm">
          <SummaryRow label="Nama" value={pelanggan.nama} />
          <SummaryRow label="Paket" value={paket.nama} />
          <SummaryRow label="Harga Paket" value={formatRupiah(paket.harga)} />
          {transaksi.antarJemputOption && (
            <SummaryRow
              label="Antar-Jemput"
              value={`+${formatRupiah(transaksi.antarJemputOption.harga)}`}
            />
          )}
          <SummaryRow
            label="TOTAL"
            value={formatRupiah(paket.harga + (transaksi.antarJemputOption?.harga ?? 0))}
          />
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
        </TkCard>

        <TkCard className="text-center text-sm text-tk-muted">
          📸 Foto kondisi barangmu akan dikirim ke WhatsApp setelah barang diterima dan
          dicek oleh tim kami di hub.
        </TkCard>

        <TkCard className="flex flex-col items-center gap-3">
          <p className="text-sm font-bold text-tk-charcoal">
            Scan QRIS atau transfer ke rekening di bawah
          </p>
          <div className="rounded-lg border-2 border-tk-charcoal bg-white p-4">
            <Image
              src="/qris-titipkuy.png"
              alt="QRIS TitipKuy!"
              width={220}
              height={310}
              className="h-auto w-[220px]"
            />
          </div>
          <p className="text-center text-xs text-tk-light">
            Berlaku untuk semua bank & e-wallet
          </p>
        </TkCard>

        <TkCard variant="sage" className="space-y-3 text-center">
          <p className="text-sm text-tk-cream">Transfer/scan QRIS lalu konfirmasi ke WA</p>
          <a
            href={getWhatsAppUrl(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(tkButtonVariants({ variant: "primary", size: "md" }), "w-full justify-center")}
          >
            Konfirmasi Pembayaran via WhatsApp
          </a>
          <p className="text-xs text-tk-cream/80">
            Admin: {ADMIN_NAME} &middot; {formatWhatsAppDisplay()}
          </p>
        </TkCard>

        <TkButton
          type="button"
          variant="secondary"
          className="w-full justify-center"
          disabled={isGeneratingPdf}
          onClick={handleDownloadPdf}
        >
          {isGeneratingPdf && <Loader2 className="mr-2 animate-spin" size={16} />}
          Download PDF Perjanjian
        </TkButton>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-tk-muted">{label}</span>
      <span className="font-bold text-tk-charcoal">{value}</span>
    </div>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-tk-cream px-4 text-center text-tk-muted">
      {children}
    </div>
  );
}
