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
  harga: "",
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
        harga: String(option.harga),
        aktif: option.aktif,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [option, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.label.trim() || !form.harga.trim()) {
      toast.error("Label dan harga wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        label: form.label,
        tipe: form.tipe,
        radiusLabel: form.radiusLabel,
        harga: Number(form.harga),
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
          <DialogTitle>{option ? "Edit Opsi Antar-Jemput" : "Tambah Opsi Antar-Jemput"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="Motor - Radius <3 km dari hub"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
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
            <Label htmlFor="radiusLabel">Radius</Label>
            <Select
              value={form.radiusLabel}
              onValueChange={(v) => v && setForm({ ...form, radiusLabel: v })}
            >
              <SelectTrigger id="radiusLabel" className="w-full">
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

          <div className="space-y-2">
            <Label htmlFor="harga">Harga (Rp)</Label>
            <Input
              id="harga"
              type="number"
              min={0}
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: e.target.value })}
              required
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
