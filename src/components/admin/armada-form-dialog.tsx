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
import { Button } from "@/components/ui/button";
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
          <DialogTitle>{armada ? "Edit Armada" : "Tambah Armada"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Armada</Label>
            <Input
              id="nama"
              placeholder="Motor Honda Beat"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipe">Tipe</Label>
            <Select value={form.tipe} onValueChange={(v) => v && setForm({ ...form, tipe: v })}>
              <SelectTrigger id="tipe" className="w-full">
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

          <div className="space-y-2">
            <Label htmlFor="platNomor">Plat Nomor</Label>
            <Input
              id="platNomor"
              placeholder="N 1234 ABC"
              value={form.platNomor}
              onChange={(e) => setForm({ ...form, platNomor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slotPerHari">Slot Per Hari</Label>
            <Input
              id="slotPerHari"
              type="number"
              min={1}
              value={form.slotPerHari}
              onChange={(e) => setForm({ ...form, slotPerHari: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2">
            <Label htmlFor="aktif" className="cursor-pointer">
              Status Aktif
            </Label>
            <Switch
              id="aktif"
              checked={form.aktif}
              onCheckedChange={(checked) => setForm({ ...form, aktif: checked === true })}
            />
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-primary-from to-primary-to text-white"
          >
            {isSaving && <Loader2 className="animate-spin" size={16} />}
            Simpan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
