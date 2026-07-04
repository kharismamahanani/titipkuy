"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { tkDangerButtonClass } from "@/lib/form-style";
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
        <TkButton type="button" variant="primary" onClick={handleAdd}>
          Tambah Armada
        </TkButton>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead className="bg-tk-charcoal text-tk-cream">
            <tr>
              <th className="px-4 py-3 font-bold">Nama</th>
              <th className="px-4 py-3 font-bold">Tipe</th>
              <th className="px-4 py-3 font-bold">Plat</th>
              <th className="px-4 py-3 font-bold">Slot/Hari</th>
              <th className="px-4 py-3 font-bold">Dipakai Antar-Jemput</th>
              <th className="px-4 py-3 font-bold">Status Aktif</th>
              <th className="px-4 py-3 font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialArmada.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-tk-muted">
                  Belum ada armada. Klik &quot;Tambah Armada&quot; untuk mulai.
                </td>
              </tr>
            )}
            {initialArmada.map((armada, index) => (
              <tr
                key={armada.id}
                className={cn(
                  "border-b border-[#D6CEC4] transition-colors last:border-0 hover:bg-tk-cream-alt",
                  index % 2 === 0 ? "bg-white" : "bg-tk-cream"
                )}
              >
                <td className="px-4 py-3 font-bold text-tk-charcoal">{armada.nama}</td>
                <td className="px-4 py-3 capitalize text-tk-charcoal">{armada.tipe}</td>
                <td className="px-4 py-3 text-tk-charcoal">{armada.platNomor ?? "-"}</td>
                <td className="px-4 py-3 text-tk-charcoal">{armada.slotPerHari}</td>
                <td className="px-4 py-3 text-tk-muted">
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
                    <TkButton type="button" size="sm" variant="secondary" onClick={() => handleEdit(armada)}>
                      Edit
                    </TkButton>
                    <button type="button" className={tkDangerButtonClass} onClick={() => handleDelete(armada)}>
                      Hapus
                    </button>
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
