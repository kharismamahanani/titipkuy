"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { normalizeWhatsAppNumber } from "@/lib/utils";
import { kodeTransaksi } from "@/lib/kode";

interface TandaiLunasButtonProps {
  id: string;
  nomorUrut: number;
  pelanggan: { nama: string; whatsapp: string };
  hargaPaketTertagih: number;
  antarJemputHarga?: number | null;
  tanggalJatuhTempo: string | Date;
  statusBayar: "BELUM_BAYAR" | "LUNAS";
  onSuccess?: () => void;
}

export function TandaiLunasButton({
  id,
  nomorUrut,
  pelanggan,
  hargaPaketTertagih,
  antarJemputHarga,
  tanggalJatuhTempo,
  statusBayar,
  onSuccess,
}: TandaiLunasButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [justLunas, setJustLunas] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusBayar: "LUNAS" }),
      });
      if (!res.ok) throw new Error();

      toast.success("Ditandai lunas");
      setJustLunas(true);
      onSuccess?.();
      router.refresh();
    } catch {
      toast.error("Gagal menandai lunas");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKirimWa() {
    const noWA = normalizeWhatsAppNumber(pelanggan.whatsapp);
    const kode = kodeTransaksi(nomorUrut);
    const namaDepan = pelanggan.nama.trim().split(/\s+/)[0];
    const totalBiaya = hargaPaketTertagih + (antarJemputHarga ?? 0);
    const tanggal = format(new Date(tanggalJatuhTempo), "d MMM yyyy", { locale: localeId });

    const pesan = encodeURIComponent(
      `Halo ${namaDepan}!

Pembayaran untuk *${kode}* sudah kami terima ✅

Total yang dibayar: Rp ${totalBiaya.toLocaleString("id-ID")}

Barangmu aman tersimpan di Hub TitipKuy!
Jatuh tempo pengambilan: *${tanggal}*

Hubungi kami jika ada pertanyaan:
wa.me/6282330736696

TitipKuy! 📦 titipkuy.online`
    );

    window.open(`https://wa.me/${noWA}?text=${pesan}`, "_blank");
  }

  if (justLunas) {
    return (
      <TkButton type="button" size="sm" variant="secondary" onClick={handleKirimWa}>
        <MessageCircle className="mr-1.5" size={14} />
        Kirim Konfirmasi Lunas ke WA
      </TkButton>
    );
  }

  if (statusBayar === "LUNAS") return null;

  return (
    <TkButton type="button" size="sm" variant="primary" disabled={isLoading} onClick={handleClick}>
      {isLoading && <Loader2 className="mr-1.5 animate-spin" size={14} />}
      Tandai Lunas
    </TkButton>
  );
}
