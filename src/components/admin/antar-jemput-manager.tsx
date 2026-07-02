"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatRupiah } from "@/lib/utils";
import { AntarJemputFormDialog } from "@/components/admin/antar-jemput-form-dialog";
import type { AntarJemputOption } from "@/types/antar-jemput";

interface AntarJemputManagerProps {
  initialOptions: AntarJemputOption[];
}

export function AntarJemputManager({ initialOptions }: AntarJemputManagerProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<AntarJemputOption | null>(null);

  function handleAdd() {
    setEditingOption(null);
    setIsDialogOpen(true);
  }

  function handleEdit(option: AntarJemputOption) {
    setEditingOption(option);
    setIsDialogOpen(true);
  }

  async function handleToggleAktif(option: AntarJemputOption, aktif: boolean) {
    try {
      const res = await fetch(`/api/admin/antar-jemput/${option.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...option, aktif }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui opsi antar-jemput");
    }
  }

  async function handleNonaktifkan(option: AntarJemputOption) {
    const confirmed = window.confirm(`Nonaktifkan opsi "${option.label}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/antar-jemput/${option.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Gagal menonaktifkan opsi");
        return;
      }

      toast.success("Opsi dinonaktifkan");
      router.refresh();
    } catch {
      toast.error("Gagal menonaktifkan opsi");
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
          Tambah Opsi
        </Button>
      </div>

      <div className="glass-card overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-card-border text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">Radius</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Status Aktif</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialOptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
                  Belum ada opsi antar-jemput. Klik &quot;Tambah Opsi&quot; untuk mulai.
                </td>
              </tr>
            )}
            {initialOptions.map((option) => (
              <tr key={option.id} className="border-b border-card-border last:border-0">
                <td className="px-4 py-3 font-medium">{option.label}</td>
                <td className="px-4 py-3 capitalize">{option.tipe}</td>
                <td className="px-4 py-3">{option.radiusLabel}</td>
                <td className="px-4 py-3">{formatRupiah(option.harga)}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={option.aktif}
                    onCheckedChange={(checked) => handleToggleAktif(option, checked === true)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(option)}>
                      Edit
                    </Button>
                    {option.aktif && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleNonaktifkan(option)}
                      >
                        Nonaktifkan
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AntarJemputFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} option={editingOption} />
    </div>
  );
}
