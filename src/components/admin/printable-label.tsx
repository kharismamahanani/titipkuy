import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import type { BarangLabel, TransaksiDetail } from "@/types/transaksi";

interface PrintableLabelProps {
  barang: BarangLabel;
  transaksi: TransaksiDetail;
  verifyUrl: string;
}

export function PrintableLabel({ barang, transaksi, verifyUrl }: PrintableLabelProps) {
  return (
    <div
      className="flex h-[6cm] w-[10cm] flex-col justify-between p-3 text-black"
      style={{ border: "1px dashed #999" }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold">TitipKuy! 📦</span>
      </div>

      <p className="text-center text-lg font-extrabold tracking-wide">{barang.kodeLabel}</p>

      <div className="flex items-end justify-between gap-2">
        <div className="flex-1 space-y-0.5 text-[9px] leading-tight">
          <p className="font-semibold">{transaksi.pelanggan.nama}</p>
          <p>{transaksi.paket.nama}</p>
          <p>Masuk: {format(new Date(transaksi.tanggalMasuk), "d MMM yyyy", { locale: localeId })}</p>
          <p>Tempo: {format(new Date(transaksi.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}</p>
          <p className="mt-1 italic">{barang.deskripsi}</p>
        </div>
        <QRCodeSVG value={verifyUrl} size={56} />
      </div>
    </div>
  );
}
