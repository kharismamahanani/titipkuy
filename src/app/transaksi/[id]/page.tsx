"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CheckCircle2, XCircle } from "lucide-react";
import type { VerifikasiPublik } from "@/types/transaksi";

type FetchState = "loading" | "success" | "error";

const STATUS_LABEL: Record<VerifikasiPublik["statusTransaksi"], string> = {
  AKTIF: "Aktif — masih dititipkan",
  SELESAI: "Selesai — sudah diambil",
  DIBATALKAN: "Dibatalkan",
};

export default function VerifikasiTransaksiPage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<VerifikasiPublik | null>(null);
  const [state, setState] = useState<FetchState>("loading");

  useEffect(() => {
    fetch(`/api/transaksi/${params.id}/verifikasi`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result: VerifikasiPublik) => {
        setData(result);
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

        {state === "success" && data && (
          <div className="mt-6 space-y-3 text-left text-sm">
            <div className="flex flex-col items-center gap-2 pb-2">
              <CheckCircle2 className="text-primary-from" size={40} />
              <p className="font-semibold">Barang Terverifikasi</p>
            </div>
            <Row label="Nama" value={data.namaDepan} />
            <Row label="Paket" value={data.paketNama} />
            <Row
              label="Masuk"
              value={format(new Date(data.tanggalMasuk), "d MMM yyyy", {
                locale: localeId,
              })}
            />
            <Row
              label="Jatuh Tempo"
              value={format(new Date(data.tanggalJatuhTempo), "d MMM yyyy", {
                locale: localeId,
              })}
            />
            <Row label="Status" value={STATUS_LABEL[data.statusTransaksi]} />
            {data.kodeLabel.length > 0 && (
              <div className="border-b border-card-border pb-1">
                <span className="text-foreground/60">Kode Label</span>
                <div className="mt-1 flex flex-wrap justify-end gap-1.5">
                  {data.kodeLabel.map((kode) => (
                    <span
                      key={kode}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-from"
                    >
                      {kode}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
