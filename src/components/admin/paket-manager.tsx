"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatRupiah } from "@/lib/utils";
import { PaketFormDialog } from "@/components/admin/paket-form-dialog";
import type { Paket } from "@/types/paket";

interface PaketManagerProps {
  initialPaket: Paket[];
}

export function PaketManager({ initialPaket }: PaketManagerProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPaket, setEditingPaket] = useState<Paket | null>(null);

  function handleAdd() {
    setEditingPaket(null);
    setIsDialogOpen(true);
  }

  function handleEdit(paket: Paket) {
    setEditingPaket(paket);
    setIsDialogOpen(true);
  }

  async function handleToggle(paket: Paket, field: "perluDeklarasi" | "aktif", value: boolean) {
    try {
      const res = await fetch(`/api/admin/paket/${paket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...paket, [field]: value }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui paket");
    }
  }

  async function handleDelete(paket: Paket) {
    const confirmed = window.confirm(`Hapus paket "${paket.nama}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/paket/${paket.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Gagal menghapus paket");
        return;
      }

      toast.success("Paket dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus paket");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleAdd}
          className="bg-gradient-to-r from-primary-from to-primary-to text-white"
        >
          Tambah Paket Baru
        </Button>
      </div>

      <div className="glass-card overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-card-border text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Durasi</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Perlu Deklarasi</th>
              <th className="px-4 py-3 font-medium">Status Aktif</th>
              <th className="px-4 py-3 font-medium">Urutan</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialPaket.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-foreground/50">
                  Belum ada paket. Klik &quot;Tambah Paket Baru&quot; untuk mulai.
                </td>
              </tr>
            )}
            {initialPaket.map((paket) => (
              <tr key={paket.id} className="border-b border-card-border last:border-0">
                <td className="px-4 py-3 font-medium">{paket.nama}</td>
                <td className="px-4 py-3">{formatRupiah(paket.harga)}</td>
                <td className="px-4 py-3">
                  {paket.durasiHari ? `${paket.durasiHari} hari` : "Harian"}
                </td>
                <td className="px-4 py-3 capitalize">{paket.kategori}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={paket.perluDeklarasi}
                    onCheckedChange={(checked) =>
                      handleToggle(paket, "perluDeklarasi", checked === true)
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={paket.aktif}
                    onCheckedChange={(checked) => handleToggle(paket, "aktif", checked === true)}
                  />
                </td>
                <td className="px-4 py-3">{paket.urutan}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(paket)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(paket)}
                    >
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaketFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} paket={editingPaket} />
    </div>
  );
}
