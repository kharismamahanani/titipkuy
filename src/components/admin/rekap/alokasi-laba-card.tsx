"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { TkCard } from "@/components/ui/tk-card";
import { TkButton } from "@/components/ui/tk-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";
import { formatRupiah } from "@/lib/utils";
import type { KonfigurasiKeuangan } from "@/types/rekap";

interface AlokasiLabaCardProps {
  labaBulanIni: number;
  konfigurasi: KonfigurasiKeuangan;
  bepTercapai: boolean;
  onSaved: (konfigurasi: KonfigurasiKeuangan) => void;
}

const ROWS: {
  key: "persenOperasional" | "persenPengembangan" | "persenTabungan" | "persenPribadi";
  label: string;
  keterangan: string;
}[] = [
  { key: "persenOperasional", label: "Operasional", keterangan: "dana biaya tetap bulan depan" },
  { key: "persenPengembangan", label: "Pengembangan", keterangan: "tabung untuk hub baru/iklan" },
  { key: "persenTabungan", label: "Tabungan", keterangan: "dana darurat" },
  { key: "persenPribadi", label: "Penghasilan", keterangan: "boleh diambil operator" },
];

export function AlokasiLabaCard({
  labaBulanIni,
  konfigurasi,
  bepTercapai,
  onSaved,
}: AlokasiLabaCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <TkCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-extrabold text-tk-charcoal">Alokasi Laba Bulan Ini</h2>
        <TkButton type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <Settings size={14} className="mr-1.5" />
          Atur Persentase
        </TkButton>
      </div>

      {!bepTercapai && (
        <div className="flex items-start gap-2 rounded-lg border-2 border-[#F5E642] bg-[#F5E642]/20 p-3 text-sm text-tk-charcoal">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#C0392B]" />
          <p>
            Modal belum kembali — laba bulan ini sebaiknya dikembalikan ke dana modal dulu.
          </p>
        </div>
      )}

      <p className="text-sm text-tk-muted">
        Laba bulan ini:{" "}
        <span className="font-extrabold text-tk-charcoal">{formatRupiah(labaBulanIni)}</span>
      </p>

      <div className="space-y-2 rounded-lg border-2 border-tk-charcoal bg-white p-4 text-sm">
        {ROWS.map((row) => {
          const persen = konfigurasi[row.key];
          const nominal = Math.round((labaBulanIni * persen) / 100);
          return (
            <div key={row.key} className="flex justify-between">
              <span className="text-tk-muted">
                {row.label} ({persen}%)
              </span>
              <span className="text-right">
                <span className="font-bold text-tk-charcoal">{formatRupiah(nominal)}</span>
                <span className="ml-1 text-xs text-tk-light">→ {row.keterangan}</span>
              </span>
            </div>
          );
        })}
      </div>

      <AlokasiSettingDialog
        open={open}
        onOpenChange={setOpen}
        konfigurasi={konfigurasi}
        onSaved={onSaved}
      />
    </TkCard>
  );
}

function AlokasiSettingDialog({
  open,
  onOpenChange,
  konfigurasi,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  konfigurasi: KonfigurasiKeuangan;
  onSaved: (konfigurasi: KonfigurasiKeuangan) => void;
}) {
  const [form, setForm] = useState({
    persenOperasional: String(konfigurasi.persenOperasional),
    persenPengembangan: String(konfigurasi.persenPengembangan),
    persenTabungan: String(konfigurasi.persenTabungan),
    persenPribadi: String(konfigurasi.persenPribadi),
    targetModalKembali: String(konfigurasi.targetModalKembali),
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({
      persenOperasional: String(konfigurasi.persenOperasional),
      persenPengembangan: String(konfigurasi.persenPengembangan),
      persenTabungan: String(konfigurasi.persenTabungan),
      persenPribadi: String(konfigurasi.persenPribadi),
      targetModalKembali: String(konfigurasi.targetModalKembali),
    });
  }, [konfigurasi, open]);

  const total =
    (Number(form.persenOperasional) || 0) +
    (Number(form.persenPengembangan) || 0) +
    (Number(form.persenTabungan) || 0) +
    (Number(form.persenPribadi) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (total !== 100) {
      toast.error(`Total persentase harus 100% (saat ini ${total}%)`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/konfigurasi-keuangan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persenOperasional: Number(form.persenOperasional) || 0,
          persenPengembangan: Number(form.persenPengembangan) || 0,
          persenTabungan: Number(form.persenTabungan) || 0,
          persenPribadi: Number(form.persenPribadi) || 0,
          targetModalKembali: Number(form.targetModalKembali) || 0,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan konfigurasi");

      onSaved(result);
      toast.success("Alokasi laba diperbarui");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan konfigurasi");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-tk-charcoal">Atur Persentase Alokasi Laba</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {ROWS.map((row) => (
            <div key={row.key}>
              <Label htmlFor={row.key} className={tkLabelClass}>
                {row.label} (%)
              </Label>
              <Input
                id={row.key}
                type="number"
                min={0}
                max={100}
                value={form[row.key]}
                onChange={(e) => setForm({ ...form, [row.key]: e.target.value })}
                className={tkInputClass}
              />
            </div>
          ))}

          <div>
            <Label htmlFor="targetModalKembali" className={tkLabelClass}>
              Target Modal Kembali (Rp, opsional)
            </Label>
            <Input
              id="targetModalKembali"
              type="number"
              min={0}
              placeholder="0 = pakai total dari section Modal Awal"
              value={form.targetModalKembali}
              onChange={(e) => setForm({ ...form, targetModalKembali: e.target.value })}
              className={tkInputClass}
            />
          </div>

          <p
            className={
              total === 100 ? "text-sm font-bold text-tk-sage-dark" : "text-sm font-bold text-[#C0392B]"
            }
          >
            Total: {total}% {total !== 100 && "(harus 100%)"}
          </p>

          <TkButton
            type="submit"
            variant="primary"
            disabled={isSaving || total !== 100}
            className="w-full justify-center"
          >
            {isSaving && <Loader2 className="mr-2 animate-spin" size={16} />}
            Simpan
          </TkButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
