"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TkButton } from "@/components/ui/tk-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tkInputClass, tkLabelClass, tkSelectTriggerClass } from "@/lib/form-style";

const ALASAN_OPTIONS = [
  "Pelanggan membatalkan sebelum barang masuk",
  "Pembayaran tidak masuk dalam batas waktu",
  "Barang ditolak — tidak memenuhi syarat kemasan",
  "Dokumen motor tidak valid/tidak lengkap",
  "Lainnya",
];

interface BatalkanTransaksiButtonProps {
  transaksiId: string;
  statusTransaksi: "AKTIF" | "SELESAI" | "DIBATALKAN";
  statusBayar: "BELUM_BAYAR" | "LUNAS";
  sudahMasukHub: boolean;
}

export function BatalkanTransaksiButton({
  transaksiId,
  statusTransaksi,
  statusBayar,
  sudahMasukHub,
}: BatalkanTransaksiButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [alasan, setAlasan] = useState(ALASAN_OPTIONS[0]);
  const [alasanLain, setAlasanLain] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bisaDibatalkan =
    statusTransaksi === "AKTIF" && (statusBayar === "BELUM_BAYAR" || !sudahMasukHub);

  if (!bisaDibatalkan) return null;

  async function handleConfirm() {
    const alasanFinal = alasan === "Lainnya" ? alasanLain.trim() : alasan;
    if (!alasanFinal) {
      toast.error("Alasan pembatalan wajib diisi");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${transaksiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusTransaksi: "DIBATALKAN", alasanPembatalan: alasanFinal }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membatalkan transaksi");

      toast.success("Transaksi dibatalkan");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membatalkan transaksi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <TkButton
        type="button"
        variant="secondary"
        className="border-[#C0392B] text-[#C0392B] hover:bg-[#C0392B]/10"
        onClick={() => setOpen(true)}
      >
        <XCircle className="mr-1.5" size={16} />
        Batalkan Transaksi
      </TkButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-tk-charcoal">Batalkan Transaksi</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="alasanPembatalan" className={tkLabelClass}>
                Alasan Pembatalan
              </Label>
              <Select value={alasan} onValueChange={(value) => value && setAlasan(value)}>
                <SelectTrigger id="alasanPembatalan" className={tkSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALASAN_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {alasan === "Lainnya" && (
              <div>
                <Label htmlFor="alasanLain" className={tkLabelClass}>
                  Jelaskan alasan lain
                </Label>
                <Textarea
                  id="alasanLain"
                  value={alasanLain}
                  onChange={(e) => setAlasanLain(e.target.value)}
                  className={tkInputClass}
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <TkButton
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Batal
              </TkButton>
              <TkButton type="button" variant="primary" onClick={handleConfirm} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-1.5 animate-spin" size={14} />}
                Ya, Batalkan
              </TkButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
