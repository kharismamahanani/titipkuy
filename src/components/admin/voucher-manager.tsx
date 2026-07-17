"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { tkDangerButtonClass } from "@/lib/form-style";
import { VoucherFormDialog } from "@/components/admin/voucher-form-dialog";
import type { Voucher } from "@/types/voucher";

interface VoucherManagerProps {
  initialVoucher: Voucher[];
}

export function VoucherManager({ initialVoucher }: VoucherManagerProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  function handleAdd() {
    setEditingVoucher(null);
    setIsDialogOpen(true);
  }

  function handleEdit(voucher: Voucher) {
    setEditingVoucher(voucher);
    setIsDialogOpen(true);
  }

  async function handleToggleAktif(voucher: Voucher, value: boolean) {
    try {
      const res = await fetch(`/api/admin/voucher/${voucher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...voucher, aktif: value }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui voucher");
    }
  }

  async function handleDelete(voucher: Voucher) {
    const confirmed = window.confirm(
      `Hapus voucher "${voucher.kode}"? Tindakan ini tidak bisa dibatalkan.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/voucher/${voucher.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Gagal menghapus voucher");
        return;
      }

      toast.success("Voucher dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus voucher");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <TkButton type="button" variant="primary" onClick={handleAdd}>
          Tambah Voucher Baru
        </TkButton>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-tk-charcoal text-tk-cream">
            <tr>
              <th className="px-4 py-3 font-bold">Kode</th>
              <th className="px-4 py-3 font-bold">Diskon</th>
              <th className="px-4 py-3 font-bold">Berlaku</th>
              <th className="px-4 py-3 font-bold">Kuota</th>
              <th className="px-4 py-3 font-bold">Status Aktif</th>
              <th className="px-4 py-3 font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialVoucher.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-tk-muted">
                  Belum ada voucher. Klik &quot;Tambah Voucher Baru&quot; untuk mulai.
                </td>
              </tr>
            )}
            {initialVoucher.map((voucher, index) => (
              <tr
                key={voucher.id}
                className={cn(
                  "border-b border-[#D6CEC4] transition-colors last:border-0 hover:bg-tk-cream-alt",
                  index % 2 === 0 ? "bg-white" : "bg-tk-cream"
                )}
              >
                <td className="px-4 py-3 font-bold text-tk-charcoal">{voucher.kode}</td>
                <td className="px-4 py-3 text-tk-charcoal">{voucher.persenDiskon}%</td>
                <td className="px-4 py-3 text-tk-charcoal">
                  {voucher.berlakuMulai || voucher.berlakuSampai
                    ? `${voucher.berlakuMulai ? new Date(voucher.berlakuMulai).toLocaleDateString("id-ID") : "-"} s/d ${voucher.berlakuSampai ? new Date(voucher.berlakuSampai).toLocaleDateString("id-ID") : "-"}`
                    : "Tanpa batas"}
                </td>
                <td className="px-4 py-3 text-tk-charcoal">
                  {voucher.kuota !== null ? `${voucher.terpakai}/${voucher.kuota}` : `${voucher.terpakai}/∞`}
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={voucher.aktif}
                    onCheckedChange={(checked) => handleToggleAktif(voucher, checked === true)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <TkButton
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(voucher)}
                    >
                      Edit
                    </TkButton>
                    <button
                      type="button"
                      className={tkDangerButtonClass}
                      onClick={() => handleDelete(voucher)}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <VoucherFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        voucher={editingVoucher}
      />
    </div>
  );
}
