"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";
import { formatRupiah } from "@/lib/utils";
import { kodeTransaksi } from "@/lib/kode";
import type { CekPesananResult } from "@/types/transaksi";

const STATUS_TRANSAKSI_LABEL: Record<CekPesananResult["statusTransaksi"], string> = {
  AKTIF: "Aktif — masih dititipkan",
  SELESAI: "Selesai — sudah diambil",
  DIBATALKAN: "Dibatalkan",
};

export default function CekPesananPage() {
  const [kode, setKode] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CekPesananResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kode.trim() || !whatsapp.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/cek-pesanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kodeTransaksi: kode, whatsapp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengecek pesanan");
        return;
      }

      setResult(data as CekPesananResult);
    } catch {
      setError("Gagal terhubung ke server, coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-tk-cream px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-tk-charcoal">Cek Pesanan 🔍</h1>
          <p className="mt-2 text-sm text-tk-muted">
            Masukkan kode transaksi dan No. WhatsApp yang kamu pakai saat pesan.
          </p>
        </div>

        <TkCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="kode" className={tkLabelClass}>
                Kode Transaksi
              </Label>
              <Input
                id="kode"
                placeholder="Contoh: TK-0006"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                required
                className={tkInputClass}
              />
            </div>

            <div>
              <Label htmlFor="whatsapp" className={tkLabelClass}>
                No. WhatsApp
              </Label>
              <Input
                id="whatsapp"
                placeholder="Contoh: 081234567890"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className={tkInputClass}
              />
            </div>

            <TkButton
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full justify-center"
            >
              {isLoading ? (
                <Loader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <Search className="mr-2" size={16} />
              )}
              Cek Pesanan
            </TkButton>
          </form>
        </TkCard>

        {error && (
          <TkCard className="flex flex-col items-center gap-2 text-center">
            <XCircle className="text-[#C0392B]" size={36} />
            <p className="text-sm text-tk-muted">{error}</p>
          </TkCard>
        )}

        {result && (
          <TkCard className="space-y-2 text-sm">
            <div className="flex flex-col items-center gap-1 pb-2 text-center">
              <p className="text-xs text-tk-muted">Kode Transaksi</p>
              <p className="text-xl font-extrabold text-tk-orange">
                {kodeTransaksi(result.nomorUrut)}
              </p>
            </div>
            <Row label="Nama" value={result.nama} />
            <Row label="Paket" value={`${result.paketNama} — ${formatRupiah(result.hargaPaket)}`} />
            <Row
              label="Masuk"
              value={format(new Date(result.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
            />
            <Row
              label="Jatuh Tempo"
              value={format(new Date(result.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}
            />
            <div className="flex items-center justify-between border-b-[1.5px] border-[#D6CEC4] pb-1">
              <span className="text-tk-muted">Status Bayar</span>
              <StatusBadge status={result.statusBayar}>
                {result.statusBayar === "LUNAS" ? "Lunas" : "Belum Lunas"}
              </StatusBadge>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-tk-muted">Status Transaksi</span>
              <StatusBadge status={result.statusTransaksi}>
                {STATUS_TRANSAKSI_LABEL[result.statusTransaksi]}
              </StatusBadge>
            </div>
            {result.kodeLabel.length > 0 && (
              <div className="pt-1">
                <span className="text-tk-muted">Kode Label</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {result.kodeLabel.map((label) => (
                    <span
                      key={label}
                      className="rounded-[20px] border-2 border-tk-charcoal bg-tk-orange px-2.5 py-1 text-xs font-bold text-tk-charcoal"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </TkCard>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b-[1.5px] border-[#D6CEC4] pb-1">
      <span className="text-tk-muted">{label}</span>
      <span className="font-bold text-tk-charcoal">{value}</span>
    </div>
  );
}
