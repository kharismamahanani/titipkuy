"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/pesan/progress-bar";
import { Step1DataPelanggan } from "@/components/pesan/step-1-data-pelanggan";
import { Step2PaketTanggal } from "@/components/pesan/step-2-paket-tanggal";
import { Step3UploadFoto } from "@/components/pesan/step-3-upload-foto";
import { Step4Perjanjian } from "@/components/pesan/step-4-perjanjian";
import { dataUrlToFile } from "@/lib/utils";
import { uploadToStorage } from "@/lib/supabase";
import {
  validateStep1,
  validateStep2,
  validateStep3,
} from "@/lib/pesan-validation";
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
  const preselectedPaketId = searchParams.get("paket") ?? undefined;

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
    } else if (step === 3) {
      const errors = validateStep3(formData.fotoMasukUrls);
      if (errors.length > 0) {
        toast.error(errors[0]);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 4));
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
          fotoMasukUrls: formData.fotoMasukUrls,
          tandaTanganUrl,
          checklist: formData.checklist,
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
    <div className="min-h-screen bg-bg-dark px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <ProgressBar currentStep={step} />
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {step === 1 && (
            <Step1DataPelanggan
              data={formData.pelanggan}
              errors={step1Errors}
              onChange={(pelanggan) => setFormData({ ...formData, pelanggan })}
            />
          )}

          {step === 2 && (
            <Step2PaketTanggal
              transactionId={transactionId}
              paket={formData.paket}
              tanggalMasuk={formData.tanggalMasuk}
              deklarasi={formData.deklarasi}
              antarJemputOption={formData.antarJemputOption}
              preselectedPaketId={preselectedPaketId}
              onPaketChange={(paket) => setFormData({ ...formData, paket })}
              onTanggalChange={(tanggalMasuk) =>
                setFormData({ ...formData, tanggalMasuk })
              }
              onDeklarasiChange={(deklarasi) =>
                setFormData({ ...formData, deklarasi })
              }
              onAntarJemputOptionChange={(antarJemputOption) =>
                setFormData({ ...formData, antarJemputOption })
              }
            />
          )}

          {step === 3 && (
            <Step3UploadFoto
              transactionId={transactionId}
              fotoMasukUrls={formData.fotoMasukUrls}
              onChange={(fotoMasukUrls) =>
                setFormData({ ...formData, fotoMasukUrls })
              }
            />
          )}

          {step === 4 && (
            <Step4Perjanjian
              formData={formData}
              onChecklistChange={(checklist) =>
                setFormData({ ...formData, checklist })
              }
              onTandaTanganChange={(tandaTanganDataUrl) =>
                setFormData({ ...formData, tandaTanganDataUrl })
              }
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              canSubmit={canSubmit}
            />
          )}

          {step < 4 && (
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                Kembali
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gradient-to-r from-primary-from to-primary-to text-white"
              >
                Lanjut
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="mt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Kembali
              </Button>
            </div>
          )}
        </div>
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
