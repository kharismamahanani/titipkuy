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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";
import { cn } from "@/lib/utils";
import type { Voucher } from "@/types/voucher";

const EMPTY_FORM = {
  kode: "",
  persenDiskon: "",
  aktif: true,
  berlakuMulai: "",
  berlakuSampai: "",
  kuota: "",
  deskripsi: "",
};

function toDateInputValue(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

interface VoucherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: Voucher | null;
}

export function VoucherFormDialog({ open, onOpenChange, voucher }: VoucherFormDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (voucher) {
      setForm({
        kode: voucher.kode,
        persenDiskon: String(voucher.persenDiskon),
        aktif: voucher.aktif,
        berlakuMulai: toDateInputValue(voucher.berlakuMulai),
        berlakuSampai: toDateInputValue(voucher.berlakuSampai),
        kuota: voucher.kuota != null ? String(voucher.kuota) : "",
        deskripsi: voucher.deskripsi ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [voucher, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.kode.trim() || !form.persenDiskon.trim()) {
      toast.error("Kode dan persen diskon wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        kode: form.kode.trim(),
        persenDiskon: Number(form.persenDiskon),
        aktif: form.aktif,
        berlakuMulai: form.berlakuMulai ? new Date(form.berlakuMulai).toISOString() : null,
        berlakuSampai: form.berlakuSampai ? new Date(form.berlakuSampai).toISOString() : null,
        kuota: form.kuota ? Number(form.kuota) : null,
        deskripsi: form.deskripsi || undefined,
      };

      const url = voucher ? `/api/admin/voucher/${voucher.id}` : "/api/admin/voucher";
      const method = voucher ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal menyimpan voucher");

      toast.success(voucher ? "Voucher diperbarui" : "Voucher ditambahkan");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan voucher");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-tk-charcoal">
            {voucher ? "Edit Voucher" : "Tambah Voucher Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="kode" className={tkLabelClass}>
              Kode Voucher
            </Label>
            <Input
              id="kode"
              value={form.kode}
              onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
              required
              className={tkInputClass}
              placeholder="HEMAT10"
            />
          </div>

          <div>
            <Label htmlFor="persenDiskon" className={tkLabelClass}>
              Persen Diskon (%)
            </Label>
            <Input
              id="persenDiskon"
              type="number"
              min={1}
              max={100}
              value={form.persenDiskon}
              onChange={(e) => setForm({ ...form, persenDiskon: e.target.value })}
              required
              className={tkInputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="berlakuMulai" className={tkLabelClass}>
                Berlaku Mulai
              </Label>
              <Input
                id="berlakuMulai"
                type="date"
                value={form.berlakuMulai}
                onChange={(e) => setForm({ ...form, berlakuMulai: e.target.value })}
                className={tkInputClass}
              />
            </div>
            <div>
              <Label htmlFor="berlakuSampai" className={tkLabelClass}>
                Berlaku Sampai
              </Label>
              <Input
                id="berlakuSampai"
                type="date"
                value={form.berlakuSampai}
                onChange={(e) => setForm({ ...form, berlakuSampai: e.target.value })}
                className={tkInputClass}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="kuota" className={tkLabelClass}>
              Kuota Penggunaan
            </Label>
            <Input
              id="kuota"
              type="number"
              placeholder="Kosongkan jika tidak terbatas"
              value={form.kuota}
              onChange={(e) => setForm({ ...form, kuota: e.target.value })}
              className={tkInputClass}
            />
          </div>

          <div>
            <Label htmlFor="deskripsi" className={tkLabelClass}>
              Deskripsi (opsional)
            </Label>
            <Textarea
              id="deskripsi"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className={cn(tkInputClass, "min-h-16")}
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
