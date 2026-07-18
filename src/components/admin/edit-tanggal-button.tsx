"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarCog, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TkButton } from "@/components/ui/tk-button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { tkLabelClass } from "@/lib/form-style";

interface EditTanggalButtonProps {
  transaksiId: string;
  statusTransaksi: "AKTIF" | "SELESAI" | "DIBATALKAN";
  tanggalMasuk: string | Date;
  tanggalJatuhTempo: string | Date;
}

export function EditTanggalButton({
  transaksiId,
  statusTransaksi,
  tanggalMasuk,
  tanggalJatuhTempo,
}: EditTanggalButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [masuk, setMasuk] = useState<Date>(new Date(tanggalMasuk));
  const [jatuhTempo, setJatuhTempo] = useState<Date>(new Date(tanggalJatuhTempo));
  const [isLoading, setIsLoading] = useState(false);

  if (statusTransaksi !== "AKTIF") return null;

  function handleOpen(nextOpen: boolean) {
    if (nextOpen) {
      setMasuk(new Date(tanggalMasuk));
      setJatuhTempo(new Date(tanggalJatuhTempo));
    }
    setOpen(nextOpen);
  }

  async function handleConfirm() {
    if (jatuhTempo <= masuk) {
      toast.error("Tanggal jatuh tempo harus setelah tanggal masuk");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${transaksiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggalMasuk: masuk.toISOString(),
          tanggalJatuhTempo: jatuhTempo.toISOString(),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal memperbarui tanggal");

      toast.success("Tanggal transaksi diperbarui");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui tanggal");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <TkButton type="button" variant="secondary" onClick={() => handleOpen(true)}>
        <CalendarCog className="mr-1.5" size={16} />
        Edit Tanggal
      </TkButton>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-tk-charcoal">Edit Tanggal Transaksi</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-xs text-tk-muted">
              Harga tertagih akan dihitung ulang otomatis mengikuti tanggal baru (untuk paket
              harian) dan diskon voucher (jika ada) tetap dipertahankan.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className={tkLabelClass}>Tanggal Masuk</Label>
                <div className="inline-block rounded-lg border-2 border-tk-charcoal bg-white p-2">
                  <Calendar mode="single" selected={masuk} onSelect={(d) => d && setMasuk(d)} />
                </div>
                <p className="text-xs text-tk-muted">
                  {format(masuk, "d MMMM yyyy", { locale: localeId })}
                </p>
              </div>

              <div className="space-y-2">
                <Label className={tkLabelClass}>Tanggal Jatuh Tempo</Label>
                <div className="inline-block rounded-lg border-2 border-tk-charcoal bg-white p-2">
                  <Calendar
                    mode="single"
                    selected={jatuhTempo}
                    onSelect={(d) => d && setJatuhTempo(d)}
                  />
                </div>
                <p className="text-xs text-tk-muted">
                  {format(jatuhTempo, "d MMMM yyyy", { locale: localeId })}
                </p>
              </div>
            </div>

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
                Simpan
              </TkButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
