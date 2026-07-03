"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArmadaFormDialog } from "@/components/admin/armada-form-dialog";
import type { Armada } from "@/types/armada";

interface ArmadaManagerProps {
  initialArmada: Armada[];
}

export function ArmadaManager({ initialArmada }: ArmadaManagerProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArmada, setEditingArmada] = useState<Armada | null>(null);

  function handleAdd() {
    setEditingArmada(null);
    setIsDialogOpen(true);
  }

  function handleEdit(armada: Armada) {
    setEditingArmada(armada);
    setIsDialogOpen(true);
  }

  async function handleToggleAktif(armada: Armada, aktif: boolean) {
    try {
      const res = await fetch(`/api/admin/armada/${armada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...armada, aktif }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui armada");
    }
  }

  async function handleDelete(armada: Armada) {
    const confirmed = window.confirm(`Hapus armada "${armada.nama}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/armada/${armada.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Gagal menghapus armada");
        return;
      }

      toast.success("Armada dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus armada");
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
          Tambah Armada
        </Button>
      </div>

      <div className="glass-card overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-card-border text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">Plat</th>
              <th className="px-4 py-3 font-medium">Slot/Hari</th>
              <th className="px-4 py-3 font-medium">Dipakai Antar-Jemput</th>
              <th className="px-4 py-3 font-medium">Status Aktif</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialArmada.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-foreground/50">
                  Belum ada armada. Klik &quot;Tambah Armada&quot; untuk mulai.
                </td>
              </tr>
            )}
            {initialArmada.map((armada) => (
              <tr key={armada.id} className="border-b border-card-border last:border-0">
                <td className="px-4 py-3 font-medium">{armada.nama}</td>
                <td className="px-4 py-3 capitalize">{armada.tipe}</td>
                <td className="px-4 py-3">{armada.platNomor ?? "-"}</td>
                <td className="px-4 py-3">{armada.slotPerHari}</td>
                <td className="px-4 py-3 text-foreground/60">
                  {armada.jumlahAntarJemputOption
                    ? `Dipakai oleh ${armada.jumlahAntarJemputOption} opsi antar-jemput`
                    : "Belum dipakai opsi antar-jemput"}
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={armada.aktif}
                    onCheckedChange={(checked) => handleToggleAktif(armada, checked === true)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(armada)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(armada)}
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

      <ArmadaFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} armada={editingArmada} />
    </div>
  );
}
