"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CheckCircle2, XCircle } from "lucide-react";
import type { TransaksiDetail } from "@/types/transaksi";

type FetchState = "loading" | "success" | "error";

const STATUS_LABEL: Record<TransaksiDetail["statusTransaksi"], string> = {
  AKTIF: "Aktif — masih dititipkan",
  SELESAI: "Selesai — sudah diambil",
  DIBATALKAN: "Dibatalkan",
};

export default function VerifikasiTransaksiPage({
  params,
}: {
  params: { id: string };
}) {
  const [transaksi, setTransaksi] = useState<TransaksiDetail | null>(null);
  const [state, setState] = useState<FetchState>("loading");

  useEffect(() => {
    fetch(`/api/transaksi/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: TransaksiDetail) => {
        setTransaksi(data);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [params.id]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4 py-12">
      <div className="glass-card w-full max-w-sm rounded-2xl p-6 text-center">
        <p className="gradient-text font-heading text-lg font-extrabold">TitipKuy! 📦</p>
        <p className="mt-1 text-xs text-foreground/60">Verifikasi Barang Titipan</p>

        {state === "loading" && (
          <p className="mt-6 text-sm text-foreground/60">Memuat...</p>
        )}

        {state === "error" && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <XCircle className="text-destructive" size={40} />
            <p className="text-sm text-foreground/70">
              Kode ini tidak valid atau transaksi tidak ditemukan.
            </p>
          </div>
        )}

        {state === "success" && transaksi && (
          <div className="mt-6 space-y-3 text-left text-sm">
            <div className="flex flex-col items-center gap-2 pb-2">
              <CheckCircle2 className="text-primary-from" size={40} />
              <p className="font-semibold">Barang Terverifikasi</p>
            </div>
            <Row label="No. Referensi" value={transaksi.nomorRef} />
            <Row label="Nama" value={transaksi.pelanggan.nama} />
            <Row label="Paket" value={transaksi.paket.nama} />
            <Row
              label="Masuk"
              value={format(new Date(transaksi.tanggalMasuk), "d MMM yyyy", {
                locale: localeId,
              })}
            />
            <Row
              label="Jatuh Tempo"
              value={format(new Date(transaksi.tanggalJatuhTempo), "d MMM yyyy", {
                locale: localeId,
              })}
            />
            <Row label="Status" value={STATUS_LABEL[transaksi.statusTransaksi]} />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-card-border pb-1">
      <span className="text-foreground/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
