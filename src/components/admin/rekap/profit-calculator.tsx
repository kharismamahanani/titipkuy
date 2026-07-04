"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";
import { formatRupiah } from "@/lib/utils";

const DEFAULT_BIAYA_OPERASIONAL = 650000;

interface ProfitCalculatorProps {
  omzetBulanIni: number;
  bulan: string;
  onSavePengambilan: (jumlah: number) => void;
}

export function ProfitCalculator({
  omzetBulanIni,
  bulan,
  onSavePengambilan,
}: ProfitCalculatorProps) {
  const [biayaOperasional, setBiayaOperasional] = useState(String(DEFAULT_BIAYA_OPERASIONAL));
  const [persentaseDitahan, setPersentaseDitahan] = useState(20);

  const biaya = Number(biayaOperasional) || 0;
  const labaBersih = omzetBulanIni - biaya;
  const danaDitahan = labaBersih * (persentaseDitahan / 100);
  const bolehDiambil = labaBersih - danaDitahan;
  const isRugi = biaya > omzetBulanIni;

  function handleSave() {
    onSavePengambilan(bolehDiambil);
    toast.success(`Pengambilan untuk ${bulan} dicatat`);
  }

  return (
    <TkCard className="space-y-5">
      <h2 className="font-extrabold text-tk-charcoal">Kalkulator Pembagian Laba</h2>

      <div>
        <Label htmlFor="biayaOperasional" className={tkLabelClass}>
          Estimasi Biaya Operasional Bulan Ini
        </Label>
        <Input
          id="biayaOperasional"
          type="number"
          value={biayaOperasional}
          onChange={(e) => setBiayaOperasional(e.target.value)}
          className={tkInputClass}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <Label className="font-bold text-tk-charcoal">Persentase Laba Ditahan untuk Modal Kerja</Label>
          <span className="font-bold text-tk-orange-dark">{persentaseDitahan}%</span>
        </div>
        <Slider
          value={persentaseDitahan}
          onValueChange={(value) => setPersentaseDitahan(value as number)}
          min={0}
          max={100}
          step={5}
        />
      </div>

      {isRugi && (
        <div className="flex items-start gap-2 rounded-lg border-2 border-[#C0392B] bg-white p-3 text-sm text-[#C0392B]">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>Biaya operasional lebih besar dari omzet bulan ini — bulan ini rugi.</p>
        </div>
      )}

      <div className="space-y-2 rounded-lg border-2 border-tk-charcoal bg-white p-4 text-sm">
        <Row label="Laba Bersih" value={labaBersih} highlight={isRugi} />
        <Row label={`Dana Ditahan (${persentaseDitahan}%)`} value={danaDitahan} />
        <Row label="Boleh Diambil Pemilik" value={bolehDiambil} emphasize />
      </div>

      <TkButton type="button" variant="primary" onClick={handleSave} className="w-full justify-center">
        Simpan sebagai Pengambilan Bulan Ini
      </TkButton>
    </TkCard>
  );
}

function Row({
  label,
  value,
  highlight,
  emphasize,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-tk-muted">{label}</span>
      <span
        className={
          highlight
            ? "font-bold text-[#C0392B]"
            : emphasize
              ? "font-extrabold text-tk-orange"
              : "font-bold text-tk-charcoal"
        }
      >
        {formatRupiah(value)}
      </span>
    </div>
  );
}
