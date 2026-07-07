"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { MessageCircle } from "lucide-react";
import { TkButton } from "@/components/ui/tk-button";
import { normalizeWhatsAppNumber } from "@/lib/utils";
import { kodeTransaksi } from "@/lib/kode";

interface KirimKonfirmasiMasukButtonProps {
  nomorUrut: number;
  pelanggan: { nama: string; whatsapp: string };
  paket: { nama: string };
  tanggalMasuk: string | Date;
  tanggalJatuhTempo: string | Date;
  jumlahFotoMasuk: number;
}

export function KirimKonfirmasiMasukButton({
  nomorUrut,
  pelanggan,
  paket,
  tanggalMasuk,
  tanggalJatuhTempo,
  jumlahFotoMasuk,
}: KirimKonfirmasiMasukButtonProps) {
  if (jumlahFotoMasuk === 0) return null;

  function handleClick() {
    const noWA = normalizeWhatsAppNumber(pelanggan.whatsapp);
    const kode = kodeTransaksi(nomorUrut);
    const namaDepan = pelanggan.nama.trim().split(/\s+/)[0];

    const pesan = encodeURIComponent(
      `Halo ${namaDepan}! 👋

Barangmu sudah kami terima di Hub TitipKuy! dengan selamat 📦

🔖 Kode: *${kode}*
📦 Paket: ${paket.nama}
📅 Masuk: ${format(new Date(tanggalMasuk), "d MMM yyyy", { locale: localeId })}
⏰ Jatuh Tempo: ${format(new Date(tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}

Foto kondisi barang saat masuk sudah kami dokumentasikan.
Simpan kode *${kode}* untuk pengambilan barang ya!

Terima kasih sudah percaya TitipKuy! 🙏
titipkuy.online`
    );

    window.open(`https://wa.me/${noWA}?text=${pesan}`, "_blank");
  }

  return (
    <TkButton type="button" size="sm" variant="secondary" onClick={handleClick}>
      <MessageCircle className="mr-1.5" size={14} />
      Kirim Konfirmasi ke WA Pelanggan
    </TkButton>
  );
}
