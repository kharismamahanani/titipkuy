import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import { HUB_CONFIG } from "@/lib/constants";
import type { BarangLabel, TransaksiDetail } from "@/types/transaksi";

interface ThermalLabelProps {
  barang: BarangLabel;
  transaksi: TransaksiDetail;
  verifyUrl: string;
}

const MAX_DESKRIPSI = 30;

function namaDepan(nama: string) {
  return nama.trim().split(/\s+/)[0] ?? nama;
}

function potongDeskripsi(deskripsi: string) {
  return deskripsi.length > MAX_DESKRIPSI
    ? `${deskripsi.slice(0, MAX_DESKRIPSI)}…`
    : deskripsi;
}

function namaHub(hub: string | null) {
  if (hub && hub in HUB_CONFIG) return HUB_CONFIG[hub as keyof typeof HUB_CONFIG].nama;
  return HUB_CONFIG.suhat.nama;
}

export function ThermalLabel({ barang, transaksi, verifyUrl }: ThermalLabelProps) {
  return (
    <div className="thermal-label flex h-[100mm] w-[78mm] flex-col text-black">
      <div className="thermal-label-header border-b border-black py-1 text-center text-[11px] font-bold">
        TitipKuy! · {namaHub(transaksi.hub)}
      </div>

      <div className="flex flex-1 items-center justify-center py-2">
        <QRCodeSVG className="thermal-label-qr" value={verifyUrl} size={170} />
      </div>

      <p className="thermal-label-kode border-y border-black py-1 text-center text-[16px] font-extrabold tracking-wide">
        {barang.kodeLabel}
      </p>

      <div className="thermal-label-info space-y-0.5 px-1.5 py-1.5 text-[10px] leading-tight">
        <p>Nama : {namaDepan(transaksi.pelanggan.nama)}</p>
        <p>Paket : {transaksi.paket.nama}</p>
        <p>Masuk : {format(new Date(transaksi.tanggalMasuk), "d MMM yyyy", { locale: localeId })}</p>
        <p>Tempo : {format(new Date(transaksi.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}</p>
        <p>Barang: {potongDeskripsi(barang.deskripsi)}</p>
      </div>

      <div className="border-t border-black py-1 text-center text-[8px]">
        titipkuy.online · {new Date(transaksi.createdAt).getFullYear()}
      </div>
    </div>
  );
}
