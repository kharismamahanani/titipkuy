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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Paket } from "@/types/paket";

const KATEGORI_OPTIONS = ["harian", "bulanan", "magang", "pindahan", "motor"];

const EMPTY_FORM = {
  nama: "",
  deskripsi: "",
  harga: "",
  durasiHari: "",
  kategori: "harian",
  perluDeklarasi: false,
  aktif: true,
  urutan: "0",
};

interface PaketFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paket: Paket | null;
}

export function PaketFormDialog({ open, onOpenChange, paket }: PaketFormDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (paket) {
      setForm({
        nama: paket.nama,
        deskripsi: paket.deskripsi ?? "",
        harga: String(paket.harga),
        durasiHari: paket.durasiHari != null ? String(paket.durasiHari) : "",
        kategori: paket.kategori,
        perluDeklarasi: paket.perluDeklarasi,
        aktif: paket.aktif,
        urutan: String(paket.urutan),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [paket, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nama.trim() || !form.harga.trim()) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nama: form.nama,
        deskripsi: form.deskripsi || undefined,
        harga: Number(form.harga),
        durasiHari: form.durasiHari ? Number(form.durasiHari) : null,
        kategori: form.kategori,
        perluDeklarasi: form.perluDeklarasi,
        aktif: form.aktif,
        urutan: Number(form.urutan) || 0,
      };

      const url = paket ? `/api/admin/paket/${paket.id}` : "/api/admin/paket";
      const method = paket ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal menyimpan paket");

      toast.success(paket ? "Paket diperbarui" : "Paket ditambahkan");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan paket");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{paket ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Paket</Label>
            <Input
              id="nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi Singkat</Label>
            <Textarea
              id="deskripsi"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="harga">Harga (Rp)</Label>
              <Input
                id="harga"
                type="number"
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durasiHari">Durasi (hari)</Label>
              <Input
                id="durasiHari"
                type="number"
                placeholder="Kosongkan jika harian"
                value={form.durasiHari}
                onChange={(e) => setForm({ ...form, durasiHari: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Select
              value={form.kategori}
              onValueChange={(value) => value && setForm({ ...form, kategori: value })}
            >
              <SelectTrigger id="kategori" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI_OPTIONS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urutan">Urutan Tampil di Landing Page</Label>
            <Input
              id="urutan"
              type="number"
              value={form.urutan}
              onChange={(e) => setForm({ ...form, urutan: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2">
            <Label htmlFor="perluDeklarasi" className="cursor-pointer">
              Perlu Deklarasi Barang Bernilai Tinggi?
            </Label>
            <Switch
              id="perluDeklarasi"
              checked={form.perluDeklarasi}
              onCheckedChange={(checked) =>
                setForm({ ...form, perluDeklarasi: checked === true })
              }
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
