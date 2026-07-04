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
import { dataUrlToFile } from "@/lib/utils";
import { uploadToStorage } from "@/lib/supabase";
import { validateStep1, validateStep2 } from "@/lib/pesan-validation";
import { INITIAL_FORM_DATA, type ChecklistData, type PesanFormData } from "@/types/pesan";
import type { PelangganData } from "@/types/pesan";

const REQUIRED_CHECKS: (keyof ChecklistData)[] = [
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

  function handleNext() {
    if (step === 1) {
      const errors = validateStep1(formData.pelanggan);
      setStep1Errors(errors);
      if (Object.keys(errors).length > 0) return;
    } else if (step === 2) {
      const errors = validateStep2(formData.paket, formData.tanggalMasuk, formData.deklarasi);
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

  const requiredChecks = formData.paket?.perluDeklarasi
    ? [...REQUIRED_CHECKS, "deklarasiBenar" as const]
    : REQUIRED_CHECKS;
  const canSubmit =
    requiredChecks.every((key) => formData.checklist[key]) &&
    !!formData.tandaTanganDataUrl;

  async function handleSubmit() {
    if (!canSubmit || !formData.paket || !formData.tandaTanganDataUrl) return;

    setIsSubmitting(true);
    try {
      const signatureFile = dataUrlToFile(
        formData.tandaTanganDataUrl,
        `${transactionId}.png`
      );
      const tandaTanganUrl = await uploadToStorage(
        `ttd/${transactionId}.png`,
        signatureFile
      );

      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: transactionId,
          pelanggan: formData.pelanggan,
          paketId: formData.paket.id,
          tanggalMasuk: formData.tanggalMasuk,
          nilaiDeklarasi: formData.deklarasi.nilaiDeklarasi
            ? Number(formData.deklarasi.nilaiDeklarasi)
            : undefined,
          deskripsiDeklarasi: formData.deklarasi.deskripsiDeklarasi || undefined,
          buktiKepemilikanUrl: formData.deklarasi.buktiKepemilikanUrl || undefined,
          tandaTanganUrl,
          checklist: formData.checklist,
          metodePengiriman: formData.metodePengiriman,
          antarJemputId: formData.antarJemputOption?.id || undefined,
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
              metodePengiriman={formData.metodePengiriman}
              antarJemputOption={formData.antarJemputOption}
              preselectedPaketId={preselectedPaketId}
              preselectedMode={preselectedMode}
              onPaketChange={(paket) => setFormData((prev) => ({ ...prev, paket }))}
              onTanggalChange={(tanggalMasuk) =>
                setFormData((prev) => ({ ...prev, tanggalMasuk }))
              }
              onDeklarasiChange={(deklarasi) =>
                setFormData((prev) => ({ ...prev, deklarasi }))
              }
              onMetodePengirimanChange={(metodePengiriman) =>
                setFormData((prev) => ({ ...prev, metodePengiriman }))
              }
              onAntarJemputOptionChange={(antarJemputOption) =>
                setFormData((prev) => ({ ...prev, antarJemputOption }))
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
