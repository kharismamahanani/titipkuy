"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatRupiah } from "@/lib/utils";
import { uploadToStorage } from "@/lib/supabase";
import { PenjemputanArmadaPicker } from "@/components/pesan/penjemputan-armada-picker";
import type { Paket } from "@/types/paket";
import type { DeklarasiData } from "@/types/pesan";
import type { PenjemputanData } from "@/types/slot";

const MAX_BUKTI_SIZE = 5 * 1024 * 1024; // 5MB

interface Step2Props {
  transactionId: string;
  paket: Paket | null;
  tanggalMasuk: Date | null;
  deklarasi: DeklarasiData;
  antarJemput: boolean;
  penjemputan: PenjemputanData;
  preselectedPaketId?: string;
  onPaketChange: (paket: Paket) => void;
  onTanggalChange: (date: Date) => void;
  onDeklarasiChange: (data: DeklarasiData) => void;
  onAntarJemputChange: (value: boolean) => void;
  onPenjemputanChange: (data: PenjemputanData) => void;
  onKirimMandiri: () => void;
}

export function Step2PaketTanggal({
  transactionId,
  paket,
  tanggalMasuk,
  deklarasi,
  antarJemput,
  penjemputan,
  preselectedPaketId,
  onPaketChange,
  onTanggalChange,
  onDeklarasiChange,
  onAntarJemputChange,
  onPenjemputanChange,
  onKirimMandiri,
}: Step2Props) {
  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [isUploadingBukti, setIsUploadingBukti] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/paket")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data paket");
        return res.json();
      })
      .then((data: Paket[]) => {
        if (isMounted) {
          setPaketList(data);
          setState("success");

          if (preselectedPaketId && !paket) {
            const match = data.find((item) => item.id === preselectedPaketId);
            if (match) onPaketChange(match);
          }
        }
      })
      .catch(() => {
        if (isMounted) setState("error");
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBuktiUpload(file: File) {
    if (file.size > MAX_BUKTI_SIZE) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setIsUploadingBukti(true);
    try {
      const path = `deklarasi/${transactionId}/${file.name}`;
      const url = await uploadToStorage(path, file);
      onDeklarasiChange({ ...deklarasi, buktiKepemilikanUrl: url });
      toast.success("Bukti kepemilikan terupload");
    } catch {
      toast.error("Gagal upload bukti kepemilikan, coba lagi");
    } finally {
      setIsUploadingBukti(false);
    }
  }

  const tanggalJatuhTempo =
    tanggalMasuk && paket
      ? addDays(tanggalMasuk, paket.durasiHari ?? 1)
      : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-xl font-bold">Pilih Paket & Tanggal</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Pilih paket yang sesuai, lalu tentukan tanggal masuk barang.
        </p>
      </div>

      {state === "loading" && (
        <p className="text-sm text-foreground/60">Memuat paket...</p>
      )}
      {state === "error" && (
        <p className="text-sm text-destructive">
          Gagal memuat paket. Coba muat ulang halaman ini.
        </p>
      )}

      {state === "success" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {paketList.map((item) => {
            const isSelected = paket?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onPaketChange(item)}
                className={cn(
                  "glass-card rounded-2xl p-4 text-left transition-transform hover:scale-[1.02]",
                  isSelected && "gradient-border ring-2 ring-primary-from"
                )}
              >
                <p className="font-heading font-bold">{item.nama}</p>
                <p className="text-xs text-foreground/60">
                  {item.durasiHari ? `${item.durasiHari} hari` : "Harian"}
                </p>
                <p className="gradient-text mt-2 text-lg font-extrabold">
                  {formatRupiah(item.harga)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {paket && (
        <div className="space-y-3">
          <Label>Tanggal Masuk Barang</Label>
          <div className="glass-card inline-block rounded-2xl p-2">
            <Calendar
              mode="single"
              selected={tanggalMasuk ?? undefined}
              onSelect={(date) => date && onTanggalChange(date)}
              disabled={{ before: new Date() }}
            />
          </div>

          {tanggalMasuk && tanggalJatuhTempo && (
            <p className="text-sm text-foreground/70">
              Masuk{" "}
              <span className="font-semibold text-foreground">
                {format(tanggalMasuk, "d MMMM yyyy", { locale: localeId })}
              </span>{" "}
              &rarr; Jatuh tempo{" "}
              <span className="font-semibold text-foreground">
                {format(tanggalJatuhTempo, "d MMMM yyyy", { locale: localeId })}
              </span>
            </p>
          )}
        </div>
      )}

      {paket?.perluDeklarasi && (
        <div className="glass-card space-y-4 rounded-2xl p-5">
          <p className="text-sm font-semibold text-accent">
            Paket ini butuh deklarasi nilai barang
          </p>

          <div className="space-y-2">
            <Label htmlFor="nilaiDeklarasi">Nilai Deklarasi Barang (Rp)</Label>
            <Input
              id="nilaiDeklarasi"
              type="number"
              placeholder="Contoh: 5000000"
              value={deklarasi.nilaiDeklarasi}
              onChange={(e) =>
                onDeklarasiChange({ ...deklarasi, nilaiDeklarasi: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buktiKepemilikan">
              Bukti Kepemilikan (STNK/BPKB/nota)
            </Label>
            <Input
              id="buktiKepemilikan"
              type="file"
              accept="image/*,application/pdf"
              disabled={isUploadingBukti}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBuktiUpload(file);
              }}
            />
            <p className="text-xs text-foreground/50">Maksimal 5MB.</p>
            {isUploadingBukti && (
              <p className="text-xs text-foreground/60">Mengupload...</p>
            )}
            {deklarasi.buktiKepemilikanUrl && !isUploadingBukti && (
              <p className="text-xs text-primary-from">✓ Bukti sudah terupload</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsiDeklarasi">Deskripsi Detail Barang</Label>
            <Textarea
              id="deskripsiDeklarasi"
              placeholder="Merek, model, no seri, dll"
              value={deklarasi.deskripsiDeklarasi}
              onChange={(e) =>
                onDeklarasiChange({
                  ...deklarasi,
                  deskripsiDeklarasi: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}

      {paket && tanggalMasuk && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2">
            <Label htmlFor="antarJemput" className="cursor-pointer">
              Perlu layanan antar-jemput?
            </Label>
            <Switch
              id="antarJemput"
              checked={antarJemput}
              onCheckedChange={(checked) => onAntarJemputChange(checked === true)}
            />
          </div>

          {antarJemput && (
            <PenjemputanArmadaPicker
              penjemputan={penjemputan}
              onChange={onPenjemputanChange}
              onKirimMandiri={onKirimMandiri}
            />
          )}
        </div>
      )}
    </div>
  );
}
