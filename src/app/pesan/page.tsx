"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { ProgressBar } from "@/components/pesan/progress-bar";
import { Step1DataPelanggan } from "@/components/pesan/step-1-data-pelanggan";
import { Step2PaketTanggal } from "@/components/pesan/step-2-paket-tanggal";
import { Step3Perjanjian } from "@/components/pesan/step-3-perjanjian";
import { uploadViaApi } from "@/lib/upload-via-api";
import { validateStep1, validateStep2 } from "@/lib/pesan-validation";
import { hitungPremi, tentukanTier } from "@/lib/ganti-rugi";
import { INITIAL_FORM_DATA, type ChecklistData, type PesanFormData } from "@/types/pesan";
import type { PelangganData } from "@/types/pesan";

const REQUIRED_CHECKS: (keyof ChecklistData)[] = [
  "pengemasanWajib",
  "limitGantiRugi",
  "barangTerlarang",
  "jatuhTempo",
  "lepasSetelah30Hari",
];

function PesanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPaketId = searchParams.get("paketId") ?? undefined;
  const preselectedModeParam = searchParams.get("mode");
  const preselectedMode =
    preselectedModeParam === "harian" || preselectedModeParam === "bulanan"
      ? preselectedModeParam
      : undefined;

  const [transactionId] = useState(() => crypto.randomUUID());
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PesanFormData>(INITIAL_FORM_DATA);
  const [step1Errors, setStep1Errors] = useState<
    Partial<Record<keyof PelangganData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMotor = formData.paket?.kategori === "motor";
  const nilaiDeklarasiNum = Number(formData.deklarasi.nilaiDeklarasi) || 0;
  const tierGantiRugi = tentukanTier(nilaiDeklarasiNum);

  function handleNext() {
    if (step === 1) {
      const errors = validateStep1(formData.pelanggan);
      setStep1Errors(errors);
      if (Object.keys(errors).length > 0) return;
    } else if (step === 2) {
      const errors = validateStep2(
        formData.paket,
        formData.tanggalMasuk,
        formData.deklarasi,
        formData.dokumenMotor
      );
      if (errors.length > 0) {
        toast.error(errors[0]);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  const requiredChecks = [
    ...REQUIRED_CHECKS,
    ...(tierGantiRugi !== "standar" ? (["deklarasiBenar"] as const) : []),
    ...(isMotor ? (["motorDeklarasiBenar"] as const) : []),
  ];
  // Tanda tangan divalidasi langsung di Step3Perjanjian saat tombol submit
  // diklik (baca fresh dari kanvas, bukan dari state ini yang bisa lag satu
  // render di belakang) — di sini cukup syarat checklist saja.
  const canSubmit = requiredChecks.every((key) => formData.checklist[key]);

  async function handleSubmit(tandaTanganDataUrl: string) {
    if (!canSubmit || !formData.paket) return;

    setIsSubmitting(true);
    try {
      const signatureBlobRes = await fetch(tandaTanganDataUrl);
      const signatureBlob = await signatureBlobRes.blob();
      const tandaTanganUrl = await uploadViaApi(signatureBlob, "ttd", "ttd", transactionId);

      const durasiHari = formData.paket.durasiHari ?? 1;
      const premiGantiRugi =
        tierGantiRugi === "standar" ? 0 : hitungPremi(nilaiDeklarasiNum, durasiHari);

      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: transactionId,
          pelanggan: formData.pelanggan,
          paketId: formData.paket.id,
          tanggalMasuk: formData.tanggalMasuk,
          nilaiDeklarasi: tierGantiRugi === "standar" ? undefined : nilaiDeklarasiNum,
          tierGantiRugi,
          premiGantiRugi,
          ktpUrl: formData.dokumenMotor.ktpUrl || undefined,
          stnkUrl: formData.dokumenMotor.stnkUrl || undefined,
          bpkbUrl: formData.dokumenMotor.bpkbUrl || undefined,
          tandaTanganUrl,
          checklist: formData.checklist,
          metodePengiriman: formData.metodePengiriman,
          antarJemputId: formData.antarJemputSelection?.option.id || undefined,
          layananJemput:
            formData.antarJemputSelection?.layanan === "jemput-saja" ||
            formData.antarJemputSelection?.layanan === "jemput-dan-antar" ||
            undefined,
          layananAntar:
            formData.antarJemputSelection?.layanan === "antar-saja" ||
            formData.antarJemputSelection?.layanan === "jemput-dan-antar" ||
            undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan pesanan");

      toast.success("Pesanan berhasil dikonfirmasi!");
      router.push(`/konfirmasi/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-tk-cream px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <ProgressBar currentStep={step} />
        </div>

        <TkCard className="p-6 sm:p-8">
          {step === 1 && (
            <Step1DataPelanggan
              data={formData.pelanggan}
              errors={step1Errors}
              onChange={(pelanggan) => setFormData((prev) => ({ ...prev, pelanggan }))}
            />
          )}

          {step === 2 && (
            <Step2PaketTanggal
              transactionId={transactionId}
              paket={formData.paket}
              tanggalMasuk={formData.tanggalMasuk}
              deklarasi={formData.deklarasi}
              dokumenMotor={formData.dokumenMotor}
              metodePengiriman={formData.metodePengiriman}
              antarJemputSelection={formData.antarJemputSelection}
              preselectedPaketId={preselectedPaketId}
              preselectedMode={preselectedMode}
              onPaketChange={(paket) => setFormData((prev) => ({ ...prev, paket }))}
              onTanggalChange={(tanggalMasuk) =>
                setFormData((prev) => ({ ...prev, tanggalMasuk }))
              }
              onDeklarasiChange={(deklarasi) =>
                setFormData((prev) => ({ ...prev, deklarasi }))
              }
              onDokumenMotorChange={(dokumenMotor) =>
                setFormData((prev) => ({ ...prev, dokumenMotor }))
              }
              onMetodePengirimanChange={(metodePengiriman) =>
                setFormData((prev) => ({ ...prev, metodePengiriman }))
              }
              onAntarJemputSelectionChange={(antarJemputSelection) =>
                setFormData((prev) => ({ ...prev, antarJemputSelection }))
              }
            />
          )}

          {step === 3 && (
            <Step3Perjanjian
              formData={formData}
              onChecklistChange={(checklist) =>
                setFormData((prev) => ({ ...prev, checklist }))
              }
              onTandaTanganChange={(tandaTanganDataUrl) =>
                setFormData((prev) => ({ ...prev, tandaTanganDataUrl }))
              }
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              canSubmit={canSubmit}
            />
          )}

          {step < 3 && (
            <div className="mt-8 flex justify-between">
              <TkButton
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={step === 1}
              >
                Kembali
              </TkButton>
              <TkButton type="button" variant="primary" onClick={handleNext}>
                Lanjut →
              </TkButton>
            </div>
          )}

          {step === 3 && (
            <div className="mt-4">
              <TkButton type="button" variant="secondary" onClick={handleBack}>
                Kembali
              </TkButton>
            </div>
          )}
        </TkCard>
      </div>
    </div>
  );
}

export default function PesanPage() {
  return (
    <Suspense fallback={null}>
      <PesanForm />
    </Suspense>
  );
}
