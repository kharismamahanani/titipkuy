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
import type { Armada } from "@/types/armada";

const TIPE_OPTIONS = [
  { value: "motor", label: "Motor" },
  { value: "mobil", label: "Mobil" },
];

const EMPTY_FORM = {
  nama: "",
  tipe: "motor",
  platNomor: "",
  slotPerHari: "4",
  aktif: true,
};

interface ArmadaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  armada: Armada | null;
}

export function ArmadaFormDialog({ open, onOpenChange, armada }: ArmadaFormDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (armada) {
      setForm({
        nama: armada.nama,
        tipe: armada.tipe,
        platNomor: armada.platNomor ?? "",
        slotPerHari: String(armada.slotPerHari),
        aktif: armada.aktif,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [armada, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nama.trim()) {
      toast.error("Nama armada wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nama: form.nama,
        tipe: form.tipe,
        platNomor: form.platNomor || undefined,
        slotPerHari: Number(form.slotPerHari) || 4,
        aktif: form.aktif,
      };

      const url = armada ? `/api/admin/armada/${armada.id}` : "/api/admin/armada";
      const method = armada ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal menyimpan armada");

      toast.success(armada ? "Armada diperbarui" : "Armada ditambahkan");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan armada");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-tk-charcoal">
            {armada ? "Edit Armada" : "Tambah Armada"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nama" className={tkLabelClass}>
              Nama Armada
            </Label>
            <Input
              id="nama"
              placeholder="Motor Honda Beat"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
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
            <Label htmlFor="platNomor" className={tkLabelClass}>
              Plat Nomor
            </Label>
            <Input
              id="platNomor"
              placeholder="N 1234 ABC"
              value={form.platNomor}
              onChange={(e) => setForm({ ...form, platNomor: e.target.value })}
              className={tkInputClass}
            />
          </div>

          <div>
            <Label htmlFor="slotPerHari" className={tkLabelClass}>
              Slot Per Hari
            </Label>
            <Input
              id="slotPerHari"
              type="number"
              min={1}
              value={form.slotPerHari}
              onChange={(e) => setForm({ ...form, slotPerHari: e.target.value })}
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
