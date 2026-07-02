"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
    <div className="glass-card space-y-5 rounded-2xl p-5">
      <h2 className="font-heading font-bold">Kalkulator Pembagian Laba</h2>

      <div className="space-y-2">
        <Label htmlFor="biayaOperasional">Estimasi Biaya Operasional Bulan Ini</Label>
        <Input
          id="biayaOperasional"
          type="number"
          value={biayaOperasional}
          onChange={(e) => setBiayaOperasional(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <Label>Persentase Laba Ditahan untuk Modal Kerja</Label>
          <span className="font-semibold text-primary-from">{persentaseDitahan}%</span>
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
        <div className="flex items-start gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>Biaya operasional lebih besar dari omzet bulan ini — bulan ini rugi.</p>
        </div>
      )}

      <div className="space-y-2 rounded-xl border border-card-border p-4 text-sm">
        <Row label="Laba Bersih" value={labaBersih} highlight={isRugi} />
        <Row label={`Dana Ditahan (${persentaseDitahan}%)`} value={danaDitahan} />
        <Row label="Boleh Diambil Pemilik" value={bolehDiambil} emphasize />
      </div>

      <Button
        type="button"
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-primary-from to-primary-to text-white"
      >
        Simpan sebagai Pengambilan Bulan Ini
      </Button>
    </div>
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
      <span className="text-foreground/60">{label}</span>
      <span
        className={
          highlight
            ? "font-semibold text-destructive"
            : emphasize
              ? "gradient-text font-bold"
              : "font-medium"
        }
      >
        {formatRupiah(value)}
      </span>
    </div>
  );
}
