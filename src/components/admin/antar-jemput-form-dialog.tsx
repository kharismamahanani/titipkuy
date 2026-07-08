"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TkButton } from "@/components/ui/tk-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tkInputClass, tkLabelClass, tkSelectTriggerClass } from "@/lib/form-style";
import { formatRupiah } from "@/lib/utils";
import type { AntarJemputOption } from "@/types/antar-jemput";

const TIPE_OPTIONS = [
  { value: "motor", label: "Motor" },
  { value: "mobil", label: "Mobil" },
];

const RADIUS_OPTIONS = [
  { value: "<3km", label: "<3 km" },
  { value: "3-6km", label: "3-6 km" },
];

const EMPTY_FORM = {
  label: "",
  tipe: "motor",
  radiusLabel: "<3km",
  hargaJemputSaja: "",
  hargaAntarSaja: "",
  hargaJemputDanAntar: "",
  kapasitasLabel: "",
  aktif: true,
};

interface AntarJemputFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option: AntarJemputOption | null;
}

export function AntarJemputFormDialog({ open, onOpenChange, option }: AntarJemputFormDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (option) {
      setForm({
        label: option.label,
        tipe: option.tipe,
        radiusLabel: option.radiusLabel,
        hargaJemputSaja: String(option.hargaJemputSaja),
        hargaAntarSaja: String(option.hargaAntarSaja),
        hargaJemputDanAntar: String(option.hargaJemputDanAntar),
        kapasitasLabel: option.kapasitasLabel ?? "",
        aktif: option.aktif,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [option, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.label.trim() ||
      !form.hargaJemputSaja.trim() ||
      !form.hargaAntarSaja.trim() ||
      !form.hargaJemputDanAntar.trim()
    ) {
      toast.error("Label dan ketiga harga layanan wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        label: form.label,
        tipe: form.tipe,
        radiusLabel: form.radiusLabel,
        hargaJemputSaja: Number(form.hargaJemputSaja),
        hargaAntarSaja: Number(form.hargaAntarSaja),
        hargaJemputDanAntar: Number(form.hargaJemputDanAntar),
        kapasitasLabel: form.kapasitasLabel || undefined,
        aktif: form.aktif,
      };

      const url = option ? `/api/admin/antar-jemput/${option.id}` : "/api/admin/antar-jemput";
      const method = option ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal menyimpan opsi antar-jemput");

      toast.success(option ? "Opsi diperbarui" : "Opsi ditambahkan");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan opsi antar-jemput");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-tk-charcoal">
            {option ? "Edit Opsi Antar-Jemput" : "Tambah Opsi Antar-Jemput"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label" className={tkLabelClass}>
              Label
            </Label>
            <Input
              id="label"
              placeholder="Motor - Radius <3 km dari hub"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
              className={tkInputClass}
            />
          </div>

          <div>
            <Label htmlFor="tipe" className={tkLabelClass}>
              Tipe
            </Label>
            <Select value={form.tipe} onValueChange={(v) => v && setForm({ ...form, tipe: v })}>
              <SelectTrigger id="tipe" className={tkSelectTriggerClass}>
                <SelectValue>
                  {(v: string) => TIPE_OPTIONS.find((opt) => opt.value === v)?.label ?? v}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="radiusLabel" className={tkLabelClass}>
              Radius
            </Label>
            <Select
              value={form.radiusLabel}
              onValueChange={(v) => v && setForm({ ...form, radiusLabel: v })}
            >
              <SelectTrigger id="radiusLabel" className={tkSelectTriggerClass}>
                <SelectValue>
                  {(v: string) => RADIUS_OPTIONS.find((opt) => opt.value === v)?.label ?? v}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hargaJemputSaja" className={tkLabelClass}>
              Harga Jemput Saja (Rp)
            </Label>
            <Input
              id="hargaJemputSaja"
              type="number"
              min={0}
              value={form.hargaJemputSaja}
              onChange={(e) => setForm({ ...form, hargaJemputSaja: e.target.value })}
              required
              className={tkInputClass}
            />
          </div>

          <div>
            <Label htmlFor="hargaAntarSaja" className={tkLabelClass}>
              Harga Antar Saja (Rp)
            </Label>
            <Input
              id="hargaAntarSaja"
              type="number"
              min={0}
              value={form.hargaAntarSaja}
              onChange={(e) => setForm({ ...form, hargaAntarSaja: e.target.value })}
              required
              className={tkInputClass}
            />
          </div>

          <div>
            <Label htmlFor="hargaJemputDanAntar" className={tkLabelClass}>
              Harga Jemput + Antar (Rp)
            </Label>
            <Input
              id="hargaJemputDanAntar"
              type="number"
              min={0}
              value={form.hargaJemputDanAntar}
              onChange={(e) => setForm({ ...form, hargaJemputDanAntar: e.target.value })}
              required
              className={tkInputClass}
            />
            {!!Number(form.hargaJemputSaja) && !!Number(form.hargaAntarSaja) && !!Number(form.hargaJemputDanAntar) && (
              <p className="mt-1 text-xs text-tk-muted">
                Hemat{" "}
                {formatRupiah(
                  Math.max(
                    0,
                    Number(form.hargaJemputSaja) +
                      Number(form.hargaAntarSaja) -
                      Number(form.hargaJemputDanAntar)
                  )
                )}{" "}
                dibanding beli terpisah
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="kapasitasLabel" className={tkLabelClass}>
              Kapasitas (opsional)
            </Label>
            <Input
              id="kapasitasLabel"
              placeholder="Maks. 2 Box S atau 1 Koper Kabin"
              value={form.kapasitasLabel}
              onChange={(e) => setForm({ ...form, kapasitasLabel: e.target.value })}
              className={tkInputClass}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border-2 border-tk-charcoal bg-white px-3 py-2">
            <Label htmlFor="aktif" className="cursor-pointer text-sm font-bold text-tk-charcoal">
              Status Aktif
            </Label>
            <Switch
              id="aktif"
              checked={form.aktif}
              onCheckedChange={(checked) => setForm({ ...form, aktif: checked === true })}
            />
          </div>

          <TkButton type="submit" variant="primary" disabled={isSaving} className="w-full justify-center">
            {isSaving && <Loader2 className="mr-2 animate-spin" size={16} />}
            Simpan
          </TkButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
