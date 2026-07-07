"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { tkCardVariants } from "@/components/ui/tk-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrintableLabel } from "@/components/admin/printable-label";
import { ThermalLabel } from "@/components/admin/thermal-label";
import { tkInputClass, tkLabelClass, tkSelectTriggerClass } from "@/lib/form-style";
import { cn } from "@/lib/utils";
import type { BarangLabel, TransaksiDetail } from "@/types/transaksi";

type PrintMode = "a4" | "thermal" | null;

const KATEGORI_BARANG_OPTIONS = [
  { value: "kardus", label: "Kardus" },
  { value: "elektronik", label: "Elektronik" },
  { value: "motor", label: "Motor" },
  { value: "lainnya", label: "Lainnya" },
];

interface LabelSectionProps {
  transaksi: TransaksiDetail;
  barangLabel: BarangLabel[];
}

// Section "tambah barang + cetak label" — dipakai di halaman search
// /admin/label DAN di halaman detail transaksi admin. Render dengan
// `key={transaksi.id}` di pemanggil supaya state lokal ikut reset saat
// transaksi yang dipilih berganti.
export function LabelSection({ transaksi, barangLabel: initialBarangLabel }: LabelSectionProps) {
  const [barangLabel, setBarangLabel] = useState(initialBarangLabel);
  const [deskripsiBarang, setDeskripsiBarang] = useState("");
  const [kategoriBarang, setKategoriBarang] = useState("kardus");
  const [isAdding, setIsAdding] = useState(false);
  const [printMode, setPrintMode] = useState<PrintMode>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!printMode) return;

    const handleAfterPrint = () => setPrintMode(null);
    window.addEventListener("afterprint", handleAfterPrint);
    // Tunggu DOM commit dulu (setState async) sebelum trigger print,
    // supaya area print sudah terisi konten mode yang baru.
    const timer = setTimeout(() => window.print(), 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [printMode]);

  async function handleAddBarang(e: React.FormEvent) {
    e.preventDefault();
    if (!deskripsiBarang.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/barang-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaksiId: transaksi.id,
          deskripsi: deskripsiBarang,
          kategori: kategoriBarang,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menambah barang");

      setBarangLabel((prev) => [...prev, result]);
      setDeskripsiBarang("");
      toast.success(`Barang ditambahkan: ${result.kodeLabel}`);
    } catch (error) {
      console.error("[handleAddBarang]", error);
      toast.error(error instanceof Error ? error.message : "Gagal menambah barang");
    } finally {
      setIsAdding(false);
    }
  }

  function handlePrint() {
    if (barangLabel.length === 0) return;
    setPrintMode("a4");
  }

  function handlePrintThermal() {
    if (barangLabel.length === 0) return;
    setPrintMode("thermal");
  }

  async function handleDeleteBarang(barangId: string) {
    if (!window.confirm("Hapus barang ini? Tidak bisa dibatalkan")) return;

    try {
      const res = await fetch(`/api/admin/label/${barangId}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus barang");

      setBarangLabel((prev) => prev.filter((b) => b.id !== barangId));
      toast.success("Barang dihapus");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus barang");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddBarang} className={cn(tkCardVariants(), "space-y-3")}>
        <p className="text-sm font-bold text-tk-charcoal">Tambah Barang</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
          <div>
            <Label htmlFor="deskripsiBarang" className={tkLabelClass}>
              Deskripsi Barang
            </Label>
            <Input
              id="deskripsiBarang"
              placeholder="Kardus 1 - Pakaian"
              value={deskripsiBarang}
              onChange={(e) => setDeskripsiBarang(e.target.value)}
              required
              className={tkInputClass}
            />
          </div>
          <div>
            <Label htmlFor="kategoriBarang" className={tkLabelClass}>
              Kategori
            </Label>
            <Select
              value={kategoriBarang}
              onValueChange={(value) => value && setKategoriBarang(value)}
            >
              <SelectTrigger id="kategoriBarang" className={tkSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI_BARANG_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TkButton type="submit" variant="primary" disabled={isAdding} className="self-end">
            {isAdding && <Loader2 className="mr-1.5 animate-spin" size={14} />}
            Tambah
          </TkButton>
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-tk-charcoal">
            Daftar Barang ({barangLabel.length})
          </p>
          <TkButton
            type="button"
            variant="primary"
            disabled={barangLabel.length === 0}
            onClick={handlePrint}
          >
            🖨️ Print Label A4
          </TkButton>
        </div>

        <div className="flex flex-col items-end gap-2 rounded-lg border-2 border-dashed border-tk-charcoal/40 bg-tk-cream-alt p-3">
          <p className="text-right text-[11px] leading-snug text-tk-muted">
            Pengaturan printer: Xprinter XP-420B | Ukuran: 78×100mm | Margin: None |
            Skala: 100% | Hilangkan header/footer
          </p>
          <TkButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={barangLabel.length === 0}
            onClick={handlePrintThermal}
          >
            🖨️ Print Thermal 78×100mm
          </TkButton>
        </div>

        {barangLabel.length === 0 ? (
          <p className="text-sm text-tk-light">Belum ada barang ditambahkan.</p>
        ) : (
          <div className="divide-y divide-[#D6CEC4] rounded-lg border-2 border-tk-charcoal bg-white">
            {barangLabel.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-bold text-tk-charcoal">{b.deskripsi}</p>
                  <p className="text-xs capitalize text-tk-muted">{b.kategori}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-tk-orange">{b.kodeLabel}</span>
                  {transaksi.statusTransaksi === "AKTIF" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBarang(b.id)}
                      aria-label="Hapus barang"
                      className="text-tk-light hover:text-[#C0392B]"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {printMode === "a4" && (
        <style>{`
          @media print {
            body > *:not(.label-print-area) { display: none !important; }
            .label-print-area { display: block !important; }
          }
        `}</style>
      )}

      {printMode === "thermal" && (
        <style>{`
          @media print {
            @page { size: 78mm 100mm; margin: 2mm; }
            body > *:not(.label-print-area) { display: none !important; }
            .label-print-area { display: block !important; }
            .thermal-label {
              width: 74mm; height: 96mm;
              page-break-after: always;
              font-family: 'Nunito', Arial, sans-serif;
              padding: 2mm; box-sizing: border-box;
            }
            .thermal-label-header {
              font-size: 7pt; font-weight: 800;
              text-align: center; border-bottom: 1pt solid #3D4A41;
              padding-bottom: 1mm; margin-bottom: 2mm;
            }
            .thermal-label-qr {
              width: 50mm; height: 50mm;
              margin: 0 auto 2mm; display: block;
            }
            .thermal-label-kode {
              font-size: 12pt; font-weight: 800;
              text-align: center; margin-bottom: 2mm;
              letter-spacing: 1px;
            }
            .thermal-label-info {
              font-size: 6pt; line-height: 1.5;
              border-top: 0.5pt solid #ccc; padding-top: 1mm;
            }
          }
        `}</style>
      )}

      {printMode &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="label-print-area hidden">
            {barangLabel.map((barang) =>
              printMode === "thermal" ? (
                <ThermalLabel
                  key={barang.id}
                  barang={barang}
                  transaksi={transaksi}
                  verifyUrl={`${origin}/transaksi/${transaksi.id}`}
                />
              ) : (
                <PrintableLabel
                  key={barang.id}
                  barang={barang}
                  transaksi={transaksi}
                  verifyUrl={`${origin}/transaksi/${transaksi.id}`}
                />
              )
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
