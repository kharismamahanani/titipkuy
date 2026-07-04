"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { Switch } from "@/components/ui/switch";
import { formatRupiah, cn } from "@/lib/utils";
import { tkDangerButtonClass } from "@/lib/form-style";
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
        <TkButton type="button" variant="primary" onClick={handleAdd}>
          Tambah Paket Baru
        </TkButton>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-tk-charcoal text-tk-cream">
            <tr>
              <th className="px-4 py-3 font-bold">Nama</th>
              <th className="px-4 py-3 font-bold">Harga</th>
              <th className="px-4 py-3 font-bold">Durasi</th>
              <th className="px-4 py-3 font-bold">Kategori</th>
              <th className="px-4 py-3 font-bold">Perlu Deklarasi</th>
              <th className="px-4 py-3 font-bold">Status Aktif</th>
              <th className="px-4 py-3 font-bold">Urutan</th>
              <th className="px-4 py-3 font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialPaket.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-tk-muted">
                  Belum ada paket. Klik &quot;Tambah Paket Baru&quot; untuk mulai.
                </td>
              </tr>
            )}
            {initialPaket.map((paket, index) => (
              <tr
                key={paket.id}
                className={cn(
                  "border-b border-[#D6CEC4] transition-colors last:border-0 hover:bg-tk-cream-alt",
                  index % 2 === 0 ? "bg-white" : "bg-tk-cream"
                )}
              >
                <td className="px-4 py-3 font-bold text-tk-charcoal">{paket.nama}</td>
                <td className="px-4 py-3 text-tk-charcoal">{formatRupiah(paket.harga)}</td>
                <td className="px-4 py-3 text-tk-charcoal">
                  {paket.durasiHari ? `${paket.durasiHari} hari` : "Harian"}
                </td>
                <td className="px-4 py-3 capitalize text-tk-charcoal">{paket.kategori}</td>
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
                <td className="px-4 py-3 text-tk-charcoal">{paket.urutan}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <TkButton type="button" size="sm" variant="secondary" onClick={() => handleEdit(paket)}>
                      Edit
                    </TkButton>
                    <button type="button" className={tkDangerButtonClass} onClick={() => handleDelete(paket)}>
                      Hapus
                    </button>
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
