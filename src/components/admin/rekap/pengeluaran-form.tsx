"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";
import { KATEGORI_PENGELUARAN } from "@/lib/pengeluaran";
import type { Pengeluaran } from "@/types/rekap";

interface PengeluaranFormProps {
  onSaved: (pengeluaran: Pengeluaran) => void;
}

export function PengeluaranForm({ onSaved }: PengeluaranFormProps) {
  const [tanggal, setTanggal] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [kategori, setKategori] = useState<string>(KATEGORI_PENGELUARAN[0].value);
  const [deskripsi, setDeskripsi] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const jumlahNum = Number(jumlah) || 0;
  const canSubmit = tanggal && kategori && deskripsi.trim() && jumlahNum > 0 && !isSaving;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/pengeluaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanggal, kategori, deskripsi: deskripsi.trim(), jumlah: jumlahNum }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan pengeluaran");

      onSaved(result);
      toast.success("Pengeluaran dicatat");
      setDeskripsi("");
      setJumlah("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan pengeluaran");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <Label htmlFor="pengeluaranTanggal" className={tkLabelClass}>
          Tanggal
        </Label>
        <Input
          id="pengeluaranTanggal"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className={tkInputClass}
        />
      </div>

      <div>
        <Label className={tkLabelClass}>Kategori</Label>
        <Select value={kategori} onValueChange={(v) => v && setKategori(v)}>
          <SelectTrigger className={tkInputClass}>
            <SelectValue>
              {(v: string) => KATEGORI_PENGELUARAN.find((k) => k.value === v)?.label ?? v}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {KATEGORI_PENGELUARAN.map((k) => (
              <SelectItem key={k.value} value={k.value}>
                {k.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="pengeluaranDeskripsi" className={tkLabelClass}>
          Deskripsi
        </Label>
        <Input
          id="pengeluaranDeskripsi"
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="contoh: bensin motor 2L"
          className={tkInputClass}
        />
      </div>

      <div>
        <Label htmlFor="pengeluaranJumlah" className={tkLabelClass}>
          Jumlah
        </Label>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-tk-charcoal">Rp</span>
          <Input
            id="pengeluaranJumlah"
            type="number"
            min={1}
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="0"
            className={tkInputClass}
          />
        </div>
      </div>

      <div className="flex items-end">
        <TkButton
          type="button"
          variant="primary"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full justify-center"
        >
          + Catat Pengeluaran
        </TkButton>
      </div>
    </div>
  );
}
