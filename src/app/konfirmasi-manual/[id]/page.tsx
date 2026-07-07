"use client";

import { Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Image from "next/image";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { Checkbox } from "@/components/ui/checkbox";
import { PerjanjianDialog } from "@/components/pesan/perjanjian-dialog";
import { SignatureCanvas } from "@/components/pesan/signature-canvas";
import { PerjanjianPdfDocument } from "@/components/konfirmasi/perjanjian-pdf";
import { CHECKLIST_ITEMS, DEKLARASI_ITEM, MOTOR_ITEM } from "@/lib/checklist-items";
import { cn, dataUrlToFile, formatRupiah } from "@/lib/utils";
import { uploadToStorage } from "@/lib/supabase";
import { uploadViaApi } from "@/lib/upload-via-api";
import { ADMIN_NAME, formatWhatsAppDisplay, getWhatsAppUrl } from "@/constants/site";
import { kodeTransaksi } from "@/lib/kode";
import type { ChecklistData } from "@/types/pesan";
import type { TransaksiDetail, Foto } from "@/types/transaksi";

type PageState = "loading" | "error" | "ready";
type ErrorCode = "TOKEN_MISSING" | "NOT_FOUND" | "EXPIRED" | "UNKNOWN";

type KonfirmasiManualData = TransaksiDetail & {
  fotoMasuk: Foto[];
  alreadyConfirmed: boolean;
};

const EMPTY_CHECKLIST: ChecklistData = {
  pengemasanWajib: false,
  limitGantiRugi: false,
  barangTerlarang: false,
  jatuhTempo: false,
  lepasSetelah30Hari: false,
  deklarasiBenar: false,
  motorDeklarasiBenar: false,
};

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  TOKEN_MISSING: "Link ini tidak lengkap. Pastikan kamu membuka link yang dikirim admin TitipKuy! secara utuh.",
  NOT_FOUND: "Link tidak valid. Pastikan kamu membuka link yang dikirim admin TitipKuy!.",
  EXPIRED: "Link ini sudah kedaluwarsa (berlaku 24 jam). Hubungi admin TitipKuy! untuk minta link baru.",
  UNKNOWN: "Terjadi kesalahan. Coba muat ulang halaman ini.",
};

const TK_CHECKBOX_CLASS =
  "mt-0.5 rounded-[4px] border-tk-charcoal data-checked:border-tk-charcoal data-checked:bg-tk-orange data-checked:text-tk-charcoal";

function KonfirmasiManualContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<PageState>("loading");
  const [errorCode, setErrorCode] = useState<ErrorCode>("UNKNOWN");
  const [data, setData] = useState<KonfirmasiManualData | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistData>(EMPTY_CHECKLIST);
  const [tandaTanganDataUrl, setTandaTanganDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorCode("TOKEN_MISSING");
      setState("error");
      return;
    }

    fetch(`/api/konfirmasi-manual/${params.id}?token=${token}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          setErrorCode((body.error as ErrorCode) ?? "UNKNOWN");
          setState("error");
          return;
        }
        setData(body);
        setIsConfirmed(body.alreadyConfirmed);
        setState("ready");
      })
      .catch(() => {
        setErrorCode("UNKNOWN");
        setState("error");
      });
  }, [params.id, token]);

  const requiredChecks: (keyof ChecklistData)[] = [
    "pengemasanWajib",
    "limitGantiRugi",
    "barangTerlarang",
    "jatuhTempo",
    "lepasSetelah30Hari",
    ...(data?.paket.perluDeklarasi ? (["deklarasiBenar"] as const) : []),
    ...(data?.paket.kategori === "motor" ? (["motorDeklarasiBenar"] as const) : []),
  ];
  const canSubmit = requiredChecks.every((key) => checklist[key]) && !!tandaTanganDataUrl;

  function handleSimpanQris() {
    const link = document.createElement("a");
    link.href = "/qris-titipkuy.png";
    link.download = "QRIS-TitipKuy.png";
    link.click();
  }

  async function handleSubmit() {
    if (!canSubmit || !data || !tandaTanganDataUrl || !token) return;

    setIsSubmitting(true);
    try {
      const signatureFile = dataUrlToFile(tandaTanganDataUrl, `${data.id}.png`);
      const tandaTanganUrl = await uploadViaApi(signatureFile, "ttd", "ttd", data.id);

      const patchRes = await fetch(`/api/konfirmasi-manual/${data.id}?token=${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist, tandaTanganUrl }),
      });
      const patchResult = await patchRes.json();
      if (!patchRes.ok) throw new Error(patchResult.error || "Gagal menyimpan konfirmasi");

      const updated: KonfirmasiManualData = {
        ...data,
        tandaTanganUrl,
      };

      try {
        const blob = await pdf(<PerjanjianPdfDocument transaksi={updated} />).toBlob();
        const pdfFile = new File([blob], `${data.id}.pdf`, { type: "application/pdf" });
        const pdfUrl = await uploadToStorage(`perjanjian/${data.id}.pdf`, pdfFile);
        await fetch(`/api/transaksi/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfUrl }),
        });
        setData({ ...updated, pdfUrl });
      } catch (pdfError) {
        console.error(pdfError);
        setData(updated);
        toast.warning("Konfirmasi tersimpan, tapi PDF gagal dibuat otomatis");
      }

      setIsConfirmed(true);
      toast.success("Konfirmasi berhasil!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan konfirmasi");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (state === "loading") {
    return <CenteredMessage>Memuat data pesanan...</CenteredMessage>;
  }

  if (state === "error") {
    return (
      <CenteredMessage>
        <XCircle className="mx-auto mb-4 text-[#C0392B]" size={48} />
        <p className="mx-auto max-w-sm">{ERROR_MESSAGES[errorCode]}</p>
      </CenteredMessage>
    );
  }

  if (!data) return null;

  const { pelanggan, paket } = data;
  const items = [
    ...CHECKLIST_ITEMS,
    ...(paket.perluDeklarasi ? [DEKLARASI_ITEM] : []),
    ...(paket.kategori === "motor" ? [MOTOR_ITEM] : []),
  ];
  const waMessage = `Halo TitipKuy! Saya sudah bayar order ${kodeTransaksi(data.nomorUrut)} a.n ${pelanggan.nama}. Bukti terlampir.`;

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-tk-cream px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl space-y-6">
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-tk-sage-dark" size={72} strokeWidth={1.5} />
            <h1 className="mt-4 text-2xl font-extrabold text-tk-charcoal sm:text-3xl">
              Pesanan Dikonfirmasi! 🎉
            </h1>
          </div>

          <div className="text-center">
            <p className="text-sm text-tk-muted">Nomor Referensi</p>
            <p className="text-3xl font-extrabold text-tk-orange sm:text-4xl">
              {kodeTransaksi(data.nomorUrut)}
            </p>
          </div>

          <TkCard className="space-y-2 text-sm">
            <SummaryRow label="Nama" value={pelanggan.nama} />
            <SummaryRow label="Paket" value={paket.nama} />
            <SummaryRow label="Harga Paket" value={formatRupiah(paket.harga)} />
            {data.antarJemputOption && (
              <SummaryRow
                label="Antar-Jemput"
                value={`+${formatRupiah(data.antarJemputOption.harga)}`}
              />
            )}
            <SummaryRow
              label="TOTAL"
              value={formatRupiah(paket.harga + (data.antarJemputOption?.harga ?? 0))}
            />
            <SummaryRow
              label="Masuk"
              value={format(new Date(data.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
            />
            <SummaryRow
              label="Jatuh tempo"
              value={format(new Date(data.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}
            />
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
                style={{ cursor: "pointer" }}
                onClick={handleSimpanQris}
              />
            </div>
            <TkButton type="button" variant="secondary" size="sm" onClick={handleSimpanQris}>
              ⬇️ Simpan QRIS
            </TkButton>
            <p className="text-center text-xs text-tk-light">
              Berlaku untuk semua bank & e-wallet
            </p>
            <p className="text-center text-xs text-tk-light">
              Atau screenshot halaman ini untuk bayar nanti.
            </p>
          </TkCard>

          <TkCard variant="sage" className="space-y-3 text-center">
            <p className="text-sm text-tk-cream">Transfer/scan QRIS lalu konfirmasi ke WA</p>
            <a
              href={getWhatsAppUrl(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-[var(--tk-radius)] border-[2.5px] border-tk-charcoal bg-tk-orange px-6 py-3 text-center text-sm font-extrabold text-tk-charcoal [box-shadow:var(--tk-shadow)]"
            >
              Konfirmasi Pembayaran via WhatsApp
            </a>
            <p className="text-xs text-tk-cream/80">
              Admin: {ADMIN_NAME} &middot; {formatWhatsAppDisplay()}
            </p>
          </TkCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tk-cream px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-lg font-extrabold text-tk-orange">TitipKuy! 📦</p>
          <h1 className="mt-2 text-xl font-bold text-tk-charcoal">Konfirmasi Pesananmu</h1>
          <p className="mt-1 text-sm text-tk-muted">
            Order sudah dibuat admin — cek ringkasan, setujui pernyataan kesediaan, lalu tanda tangan.
          </p>
        </div>

        <TkCard className="space-y-2 text-sm">
          <SummaryRow label="Kode Transaksi" value={kodeTransaksi(data.nomorUrut)} />
          <SummaryRow label="Nama" value={pelanggan.nama} />
          <SummaryRow label="Paket" value={paket.nama} />
          <SummaryRow label="Harga Paket" value={formatRupiah(paket.harga)} />
          {data.antarJemputOption && (
            <SummaryRow
              label="Antar-Jemput"
              value={`+${formatRupiah(data.antarJemputOption.harga)}`}
            />
          )}
          <SummaryRow
            label="TOTAL"
            value={formatRupiah(paket.harga + (data.antarJemputOption?.harga ?? 0))}
          />
          <SummaryRow
            label="Masuk"
            value={format(new Date(data.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
          />
          <SummaryRow
            label="Jatuh tempo"
            value={format(new Date(data.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}
          />
          {paket.perluDeklarasi && data.nilaiDeklarasi && (
            <SummaryRow label="Nilai Deklarasi" value={formatRupiah(data.nilaiDeklarasi)} />
          )}
        </TkCard>

        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <label
                key={item.key}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-[var(--tk-radius)] border-2 border-tk-charcoal bg-white p-4 [box-shadow:var(--tk-shadow-sm)]"
                )}
              >
                <Checkbox
                  checked={checklist[item.key]}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, [item.key]: checked === true })
                  }
                  className={TK_CHECKBOX_CLASS}
                />
                <Icon className="mt-0.5 shrink-0 text-tk-orange" size={18} />
                <span className="text-sm text-tk-charcoal">{item.label}</span>
              </label>
            );
          })}
        </div>

        <PerjanjianDialog />

        <div className="space-y-2">
          <p className="text-sm font-bold text-tk-charcoal">Tanda Tangan Digital</p>
          <SignatureCanvas onChange={setTandaTanganDataUrl} />
        </div>

        <TkCard className="text-center text-sm text-tk-muted">
          📸 Foto kondisi barangmu akan dikirim ke WhatsApp setelah barang diterima dan
          dicek oleh tim kami di hub.
        </TkCard>

        <TkButton
          type="button"
          variant="primary"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
          className="w-full justify-center"
        >
          {isSubmitting && <Loader2 className="mr-2 animate-spin" size={16} />}
          Konfirmasi & Bayar
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
      <div>{children}</div>
    </div>
  );
}

export default function KonfirmasiManualPage() {
  return (
    <Suspense fallback={null}>
      <KonfirmasiManualContent />
    </Suspense>
  );
}
