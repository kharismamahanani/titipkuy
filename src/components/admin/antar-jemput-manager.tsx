"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { Switch } from "@/components/ui/switch";
import { formatRupiah, cn } from "@/lib/utils";
import { tkDangerButtonClass } from "@/lib/form-style";
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
        <TkButton type="button" variant="primary" onClick={handleAdd}>
          Tambah Opsi
        </TkButton>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead className="bg-tk-charcoal text-tk-cream">
            <tr>
              <th className="px-4 py-3 font-bold">Label</th>
              <th className="px-4 py-3 font-bold">Tipe</th>
              <th className="px-4 py-3 font-bold">Radius</th>
              <th className="px-4 py-3 font-bold">Kapasitas</th>
              <th className="px-4 py-3 font-bold">Jemput Saja</th>
              <th className="px-4 py-3 font-bold">Antar Saja</th>
              <th className="px-4 py-3 font-bold">Jemput + Antar</th>
              <th className="px-4 py-3 font-bold">Status Aktif</th>
              <th className="px-4 py-3 font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialOptions.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-tk-muted">
                  Belum ada opsi antar-jemput. Klik &quot;Tambah Opsi&quot; untuk mulai.
                </td>
              </tr>
            )}
            {initialOptions.map((option, index) => (
              <tr
                key={option.id}
                className={cn(
                  "border-b border-[#D6CEC4] transition-colors last:border-0 hover:bg-tk-cream-alt",
                  index % 2 === 0 ? "bg-white" : "bg-tk-cream"
                )}
              >
                <td className="px-4 py-3 font-bold text-tk-charcoal">{option.label}</td>
                <td className="px-4 py-3 capitalize text-tk-charcoal">{option.tipe}</td>
                <td className="px-4 py-3 text-tk-charcoal">{option.radiusLabel}</td>
                <td className="px-4 py-3 text-tk-muted">{option.kapasitasLabel ?? "-"}</td>
                <td className="px-4 py-3 text-tk-charcoal">{formatRupiah(option.hargaJemputSaja)}</td>
                <td className="px-4 py-3 text-tk-charcoal">{formatRupiah(option.hargaAntarSaja)}</td>
                <td className="px-4 py-3 text-tk-charcoal">{formatRupiah(option.hargaJemputDanAntar)}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={option.aktif}
                    onCheckedChange={(checked) => handleToggleAktif(option, checked === true)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <TkButton type="button" size="sm" variant="secondary" onClick={() => handleEdit(option)}>
                      Edit
                    </TkButton>
                    {option.aktif && (
                      <button type="button" className={tkDangerButtonClass} onClick={() => handleNonaktifkan(option)}>
                        Nonaktifkan
                      </button>
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
