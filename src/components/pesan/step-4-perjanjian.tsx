"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SignatureCanvas } from "@/components/pesan/signature-canvas";
import { PerjanjianDialog } from "@/components/pesan/perjanjian-dialog";
import { formatRupiah } from "@/lib/utils";
import { CHECKLIST_ITEMS, DEKLARASI_ITEM } from "@/lib/checklist-items";
import type { ChecklistData, PesanFormData } from "@/types/pesan";

interface Step4Props {
  formData: PesanFormData;
  onChecklistChange: (checklist: ChecklistData) => void;
  onTandaTanganChange: (dataUrl: string | null) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
}

export function Step4Perjanjian({
  formData,
  onChecklistChange,
  onTandaTanganChange,
  onSubmit,
  isSubmitting,
  canSubmit,
}: Step4Props) {
  const { pelanggan, paket, tanggalMasuk, checklist } = formData;
  const items = paket?.perluDeklarasi
    ? [...CHECKLIST_ITEMS, DEKLARASI_ITEM]
    : CHECKLIST_ITEMS;

  const tanggalJatuhTempo =
    tanggalMasuk && paket ? addDays(tanggalMasuk, paket.durasiHari ?? 1) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold">Perjanjian & Konfirmasi</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Cek ringkasan pesanan, setujui perjanjian, lalu tanda tangan.
        </p>
      </div>

      <div className="glass-card space-y-2 rounded-2xl p-5 text-sm">
        <div className="flex justify-between">
          <span className="text-foreground/60">Nama</span>
          <span className="font-medium">{pelanggan.nama}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/60">Paket</span>
          <span className="font-medium">{paket?.nama}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/60">Harga</span>
          <span className="gradient-text font-bold">
            {paket ? formatRupiah(paket.harga) : "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/60">Masuk</span>
          <span className="font-medium">
            {tanggalMasuk ? format(tanggalMasuk, "d MMM yyyy", { locale: localeId }) : "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/60">Jatuh tempo</span>
          <span className="font-medium">
            {tanggalJatuhTempo
              ? format(tanggalJatuhTempo, "d MMM yyyy", { locale: localeId })
              : "-"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <label
              key={item.key}
              className="glass-card flex cursor-pointer items-start gap-3 rounded-xl p-4"
            >
              <Checkbox
                checked={checklist[item.key]}
                onCheckedChange={(checked) =>
                  onChecklistChange({ ...checklist, [item.key]: checked === true })
                }
                className="mt-0.5"
              />
              <Icon className="mt-0.5 shrink-0 text-primary-from" size={18} />
              <span className="text-sm text-foreground/80">{item.label}</span>
            </label>
          );
        })}
      </div>

      <PerjanjianDialog />

      <div className="space-y-2">
        <p className="text-sm font-medium">Tanda Tangan Digital</p>
        <SignatureCanvas onChange={onTandaTanganChange} />
      </div>

      <Button
        type="button"
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
        className="w-full bg-gradient-to-r from-primary-from to-primary-to text-white"
        size="lg"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={16} />}
        Konfirmasi & Bayar
      </Button>
    </div>
  );
}
