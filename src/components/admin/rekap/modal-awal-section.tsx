"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tkInputClass, tkLabelClass, tkDangerButtonClass } from "@/lib/form-style";
import { cn, formatRupiah } from "@/lib/utils";
import type { ModalAwal } from "@/types/rekap";

interface ModalAwalSectionProps {
  data: ModalAwal[];
  onSaved: (item: ModalAwal) => void;
  onDeleted: (id: string) => void;
}

export function ModalAwalSection({ data, onSaved, onDeleted }: ModalAwalSectionProps) {
  const [nama, setNama] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [keterangan, setKeterangan] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const jumlahNum = Number(jumlah) || 0;
  const canSubmit = nama.trim() && jumlahNum > 0 && tanggal && !isSaving;
  const total = data.reduce((sum, m) => sum + m.jumlah, 0);

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/modal-awal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          jumlah: jumlahNum,
          tanggal,
          keterangan: keterangan.trim() || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan modal awal");

      onSaved(result);
      toast.success("Modal awal dicatat");
      setNama("");
      setJumlah("");
      setKeterangan("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan modal awal");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/modal-awal/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleted(id);
      toast.success("Modal awal dihapus");
    } catch {
      toast.error("Gagal menghapus modal awal");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Label htmlFor="modalNama" className={tkLabelClass}>
            Nama Item
          </Label>
          <Input
            id="modalNama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="contoh: Thermal Printer Xprinter XP-420B"
            className={tkInputClass}
          />
        </div>
        <div>
          <Label htmlFor="modalJumlah" className={tkLabelClass}>
            Jumlah
          </Label>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-tk-charcoal">Rp</span>
            <Input
              id="modalJumlah"
              type="number"
              min={1}
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="0"
              className={tkInputClass}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="modalTanggal" className={tkLabelClass}>
            Tanggal Beli
          </Label>
          <Input
            id="modalTanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={tkInputClass}
          />
        </div>
        <div>
          <Label htmlFor="modalKeterangan" className={tkLabelClass}>
            Keterangan (opsional)
          </Label>
          <Input
            id="modalKeterangan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="opsional"
            className={tkInputClass}
          />
        </div>
      </div>

      <TkButton
        type="button"
        variant="primary"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="w-full justify-center sm:w-auto"
      >
        + Catat Modal Awal
      </TkButton>

      {data.length === 0 ? (
        <p className="text-sm text-tk-light">Belum ada modal awal dicatat.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead className="bg-tk-charcoal text-tk-cream">
              <tr>
                <th className="px-4 py-3 font-bold">Tanggal Beli</th>
                <th className="px-4 py-3 font-bold">Nama Item</th>
                <th className="px-4 py-3 font-bold">Keterangan</th>
                <th className="px-4 py-3 font-bold">Jumlah</th>
                <th className="px-4 py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-[#D6CEC4] transition-colors last:border-0 hover:bg-tk-cream-alt",
                    index % 2 === 0 ? "bg-white" : "bg-tk-cream"
                  )}
                >
                  <td className="px-4 py-3 text-tk-charcoal">
                    {format(new Date(item.tanggal), "d MMM yyyy", { locale: localeId })}
                  </td>
                  <td className="px-4 py-3 font-bold text-tk-charcoal">{item.nama}</td>
                  <td className="px-4 py-3 text-tk-muted">{item.keterangan ?? "-"}</td>
                  <td className="px-4 py-3 font-bold text-tk-charcoal">{formatRupiah(item.jumlah)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className={cn(tkDangerButtonClass, "px-3 py-1.5")}
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-tk-charcoal bg-tk-cream-alt">
                <td className="px-4 py-3 font-extrabold text-tk-charcoal" colSpan={3}>
                  Total Modal Awal
                </td>
                <td className="px-4 py-3 font-extrabold text-tk-charcoal" colSpan={2}>
                  {formatRupiah(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
