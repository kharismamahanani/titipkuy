"use client";

import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";
import { KATEGORI_PENGELUARAN, SUBKATEGORI_BY_KATEGORI } from "@/lib/pengeluaran";
import type { KategoriPengeluaran } from "@/lib/pengeluaran";
import type { Pengeluaran } from "@/types/rekap";

interface PengeluaranFormProps {
  activeKategori: KategoriPengeluaran;
  onSaved: (pengeluaran: Pengeluaran) => void;
}

export function PengeluaranForm({ activeKategori, onSaved }: PengeluaranFormProps) {
  const subKategoriOptions = SUBKATEGORI_BY_KATEGORI[activeKategori];
  const [tanggal, setTanggal] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [subKategori, setSubKategori] = useState<string>(subKategoriOptions[0].value);
  const [deskripsi, setDeskripsi] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSubKategori(subKategoriOptions[0].value);
  }, [activeKategori, subKategoriOptions]);

  const jumlahNum = Number(jumlah) || 0;
  const canSubmit = tanggal && subKategori && deskripsi.trim() && jumlahNum > 0 && !isSaving;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/pengeluaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal,
          kategori: activeKategori,
          subKategori,
          deskripsi: deskripsi.trim(),
          jumlah: jumlahNum,
        }),
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
        <Label className={tkLabelClass}>Subkategori</Label>
        <Select value={subKategori} onValueChange={(v) => v && setSubKategori(v)}>
          <SelectTrigger className={tkInputClass}>
            <SelectValue>
              {(v: string) => subKategoriOptions.find((k) => k.value === v)?.label ?? v}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {subKategoriOptions.map((k) => (
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
            className={cn(tkInputClass)}
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

export function KategoriTabs({
  active,
  onChange,
}: {
  active: KategoriPengeluaran;
  onChange: (kategori: KategoriPengeluaran) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {KATEGORI_PENGELUARAN.map((k) => (
        <button
          key={k.value}
          type="button"
          onClick={() => onChange(k.value)}
          className={cn(
            "rounded-lg border-2 border-tk-charcoal px-4 py-2 text-sm font-bold transition-colors",
            active === k.value ? "bg-tk-charcoal text-tk-cream" : "bg-white text-tk-charcoal"
          )}
        >
          {k.icon} {k.label}
        </button>
      ))}
    </div>
  );
}
