"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { SignatureCanvas } from "@/components/pesan/signature-canvas";
import { PerjanjianDialog } from "@/components/pesan/perjanjian-dialog";
import { formatRupiah } from "@/lib/utils";
import { CHECKLIST_ITEMS, DEKLARASI_ITEM } from "@/lib/checklist-items";
import type { ChecklistData, PesanFormData } from "@/types/pesan";

interface Step3Props {
  formData: PesanFormData;
  onChecklistChange: (checklist: ChecklistData) => void;
  onTandaTanganChange: (dataUrl: string | null) => void;
  onSubmit: () => void;
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
  const items = paket?.perluDeklarasi
    ? [...CHECKLIST_ITEMS, DEKLARASI_ITEM]
    : CHECKLIST_ITEMS;

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
            {formatRupiah((paket?.harga ?? 0) + (formData.antarJemputOption?.harga ?? 0))}
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
        <SignatureCanvas onChange={onTandaTanganChange} />
      </div>

      <TkButton
        type="button"
        variant="primary"
        size="lg"
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
        className="w-full justify-center"
      >
        {isSubmitting && <Loader2 className="mr-2 animate-spin" size={16} />}
        Konfirmasi & Bayar
      </TkButton>
    </div>
  );
}
