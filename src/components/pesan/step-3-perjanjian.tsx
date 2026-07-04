"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import {
  SignatureCanvas,
  type SignatureCanvasHandle,
} from "@/components/pesan/signature-canvas";
import { PerjanjianDialog } from "@/components/pesan/perjanjian-dialog";
import { tkErrorClass } from "@/lib/form-style";
import { formatRupiah } from "@/lib/utils";
import { CHECKLIST_ITEMS, DEKLARASI_ITEM, MOTOR_ITEM } from "@/lib/checklist-items";
import { hitungPremi, tentukanTier } from "@/lib/ganti-rugi";
import type { ChecklistData, PesanFormData } from "@/types/pesan";

interface Step3Props {
  formData: PesanFormData;
  onChecklistChange: (checklist: ChecklistData) => void;
  onTandaTanganChange: (dataUrl: string | null) => void;
  onSubmit: (tandaTanganDataUrl: string) => void;
  isSubmitting: boolean;
  canSubmit: boolean;
}

export function Step3Perjanjian({
  formData,
  onChecklistChange,
  onTandaTanganChange,
  onSubmit,
  isSubmitting,
  canSubmit,
}: Step3Props) {
  const { pelanggan, paket, tanggalMasuk, checklist } = formData;
  const isMotor = paket?.kategori === "motor";
  const nilaiDeklarasiNum = Number(formData.deklarasi.nilaiDeklarasi) || 0;
  const tierGantiRugi = tentukanTier(nilaiDeklarasiNum);
  const durasiHari = paket?.durasiHari ?? 1;
  const premi =
    tierGantiRugi === "standar" ? 0 : hitungPremi(nilaiDeklarasiNum, durasiHari);

  const items = [
    ...CHECKLIST_ITEMS,
    ...(tierGantiRugi !== "standar" ? [DEKLARASI_ITEM] : []),
    ...(isMotor ? [MOTOR_ITEM] : []),
  ];

  const signatureRef = useRef<SignatureCanvasHandle>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  function handleSubmitClick() {
    const isCanvasEmpty = signatureRef.current?.isEmpty() ?? true;
    if (isCanvasEmpty) {
      setSignatureError("Tanda tangan wajib diisi");
      return;
    }

    const dataUrl = signatureRef.current?.getDataUrl();
    if (!dataUrl) {
      setSignatureError("Tanda tangan wajib diisi");
      return;
    }

    onTandaTanganChange(dataUrl);
    setSignatureError(null);
    // Kirim dataUrl langsung (bukan mengandalkan formData.tandaTanganDataUrl)
    // karena setFormData di atas belum tentu ter-flush saat onSubmit ini
    // dijalankan sinkron sesudahnya — kalau mengandalkan state, submit bisa
    // memakai nilai lama (null) walau kanvas sudah ditandatangani.
    onSubmit(dataUrl);
  }

  const tanggalJatuhTempo =
    tanggalMasuk && paket ? addDays(tanggalMasuk, paket.durasiHari ?? 1) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-tk-charcoal">Perjanjian & Konfirmasi</h2>
        <p className="mt-1 text-sm text-tk-muted">
          Cek ringkasan pesanan, setujui perjanjian, lalu tanda tangan.
        </p>
      </div>

      <TkCard className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-tk-muted">Nama</span>
          <span className="font-bold text-tk-charcoal">{pelanggan.nama}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-tk-muted">Paket</span>
          <span className="font-bold text-tk-charcoal">
            {paket?.nama} {paket ? `— ${formatRupiah(paket.harga)}` : ""}
          </span>
        </div>
        {premi > 0 && (
          <div className="flex justify-between">
            <span className="text-tk-muted">
              Premi perlindungan {tierGantiRugi === "bernilaiTinggi" ? "2%" : "1%"}
            </span>
            <span className="font-bold text-tk-charcoal">{formatRupiah(premi)}</span>
          </div>
        )}
        {formData.antarJemputOption && (
          <div className="flex justify-between">
            <span className="text-tk-muted">Antar-jemput</span>
            <span className="font-bold text-tk-charcoal">
              {formData.antarJemputOption.label} — +{formatRupiah(formData.antarJemputOption.harga)}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t-2 border-tk-charcoal pt-2">
          <span className="font-extrabold text-tk-charcoal">TOTAL</span>
          <span className="text-lg font-extrabold text-tk-orange">
            {formatRupiah(
              (paket?.harga ?? 0) + premi + (formData.antarJemputOption?.harga ?? 0)
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-tk-muted">Masuk</span>
          <span className="font-bold text-tk-charcoal">
            {tanggalMasuk ? format(tanggalMasuk, "d MMM yyyy", { locale: localeId }) : "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-tk-muted">Jatuh tempo</span>
          <span className="font-bold text-tk-charcoal">
            {tanggalJatuhTempo
              ? format(tanggalJatuhTempo, "d MMM yyyy", { locale: localeId })
              : "-"}
          </span>
        </div>
      </TkCard>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <label
              key={item.key}
              className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-tk-charcoal bg-white p-4"
            >
              <Checkbox
                checked={checklist[item.key]}
                onCheckedChange={(checked) =>
                  onChecklistChange({ ...checklist, [item.key]: checked === true })
                }
                className="mt-0.5 rounded-[4px] border-2 border-tk-charcoal data-checked:border-tk-orange data-checked:bg-tk-orange data-checked:text-tk-charcoal"
              />
              <Icon className="mt-0.5 shrink-0 text-tk-orange" size={18} />
              <span className="text-sm text-tk-charcoal">{item.label}</span>
            </label>
          );
        })}
      </div>

      <PerjanjianDialog />

      <div>
        <p className="mb-1 text-sm font-bold text-tk-charcoal">Tanda Tangan Digital</p>
        <SignatureCanvas ref={signatureRef} onChange={onTandaTanganChange} />
        {signatureError && <p className={tkErrorClass}>{signatureError}</p>}
      </div>

      <TkButton
        type="button"
        variant="primary"
        size="lg"
        disabled={!canSubmit || isSubmitting}
        onClick={handleSubmitClick}
        className="w-full justify-center"
      >
        {isSubmitting && <Loader2 className="mr-2 animate-spin" size={16} />}
        Konfirmasi & Bayar
      </TkButton>
    </div>
  );
}
