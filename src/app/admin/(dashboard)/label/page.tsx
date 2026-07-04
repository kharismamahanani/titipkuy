"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard, tkCardVariants } from "@/components/ui/tk-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tkInputClass, tkLabelClass, tkSelectTriggerClass } from "@/lib/form-style";
import { cn, formatRupiah } from "@/lib/utils";
import type { TransaksiSearchResult } from "@/types/transaksi";

const KATEGORI_BARANG_OPTIONS = [
  { value: "kardus", label: "Kardus" },
  { value: "elektronik", label: "Elektronik" },
  { value: "motor", label: "Motor" },
  { value: "lainnya", label: "Lainnya" },
];

function AdminLabelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transaksiIdParam = searchParams.get("transaksiId");

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDeepLink, setIsLoadingDeepLink] = useState(!!transaksiIdParam);
  const [results, setResults] = useState<TransaksiSearchResult[]>([]);
  const [selected, setSelected] = useState<TransaksiSearchResult | null>(null);

  const [deskripsiBarang, setDeskripsiBarang] = useState("");
  const [kategoriBarang, setKategoriBarang] = useState("kardus");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!transaksiIdParam) return;

    fetch(`/api/admin/transaksi/${transaksiIdParam}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: TransaksiSearchResult) => setSelected(data))
      .catch(() => toast.error("Transaksi dari link tidak ditemukan"))
      .finally(() => setIsLoadingDeepLink(false));
  }, [transaksiIdParam]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/admin/transaksi?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error();
      const result: { data: TransaksiSearchResult[] } = await res.json();
      setResults(result.data);
      if (result.data.length === 0) toast.error("Transaksi tidak ditemukan");
    } catch {
      toast.error("Gagal mencari transaksi");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAddBarang(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !deskripsiBarang.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/barang-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaksiId: selected.id,
          deskripsi: deskripsiBarang,
          kategori: kategoriBarang,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menambah barang");

      setSelected({ ...selected, barangLabel: [...selected.barangLabel, result] });
      setDeskripsiBarang("");
      toast.success(`Barang ditambahkan: ${result.kodeLabel}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambah barang");
    } finally {
      setIsAdding(false);
    }
  }

  function handlePrint() {
    if (!selected) return;
    router.push(`/admin/label/print/${selected.id}`);
  }

  async function handleDeleteBarang(barangId: string) {
    if (!selected) return;
    if (!window.confirm("Hapus barang ini? Tidak bisa dibatalkan")) return;

    try {
      const res = await fetch(`/api/admin/label/${barangId}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus barang");

      setSelected({
        ...selected,
        barangLabel: selected.barangLabel.filter((b) => b.id !== barangId),
      });
      toast.success("Barang dihapus");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus barang");
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-tk-charcoal">Print Label</h1>
      <p className="mt-1 text-sm text-tk-muted">
        Cari transaksi, tambahkan barang, lalu cetak label.
      </p>

      {isLoadingDeepLink && (
        <p className="mt-6 flex items-center gap-2 text-sm text-tk-muted">
          <Loader2 className="animate-spin" size={16} />
          Memuat transaksi...
        </p>
      )}

      {!isLoadingDeepLink && (
        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <Input
            placeholder="Cari nama pelanggan atau nomor ref..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={tkInputClass}
          />
          <TkButton type="submit" variant="primary" disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="mr-1.5 animate-spin" size={16} />
            ) : (
              <Search className="mr-1.5" size={16} />
            )}
            Cari
          </TkButton>
        </form>
      )}

      {!selected && results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t)}
              className="block w-full rounded-lg border-2 border-tk-charcoal bg-white p-4 text-left transition-colors hover:bg-tk-cream-alt"
            >
              <p className="font-bold text-tk-charcoal">{t.pelanggan.nama}</p>
              <p className="text-xs text-tk-muted">
                {t.nomorRef} &middot; {t.paket.nama}
              </p>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-6 space-y-6">
          <TkCard className="space-y-2 text-sm">
            <TkButton
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelected(null);
                if (transaksiIdParam) router.replace("/admin/label");
              }}
            >
              &larr; Cari transaksi lain
            </TkButton>
            <div className="flex justify-between pt-2">
              <span className="text-tk-muted">Nama</span>
              <span className="font-bold text-tk-charcoal">{selected.pelanggan.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tk-muted">Paket</span>
              <span className="font-bold text-tk-charcoal">
                {selected.paket.nama} &middot; {formatRupiah(selected.paket.harga)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-tk-muted">Masuk</span>
              <span className="font-bold text-tk-charcoal">
                {format(new Date(selected.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-tk-muted">Jatuh Tempo</span>
              <span className="font-bold text-tk-charcoal">
                {format(new Date(selected.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}
              </span>
            </div>
          </TkCard>

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
                Daftar Barang ({selected.barangLabel.length})
              </p>
              <TkButton
                type="button"
                variant="primary"
                disabled={selected.barangLabel.length === 0}
                onClick={handlePrint}
              >
                Print Semua Label
              </TkButton>
            </div>

            {selected.barangLabel.length === 0 ? (
              <p className="text-sm text-tk-light">Belum ada barang ditambahkan.</p>
            ) : (
              <div className="divide-y divide-[#D6CEC4] rounded-lg border-2 border-tk-charcoal bg-white">
                {selected.barangLabel.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-bold text-tk-charcoal">{b.deskripsi}</p>
                      <p className="text-xs capitalize text-tk-muted">{b.kategori}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-tk-orange">{b.kodeLabel}</span>
                      {selected.statusTransaksi === "AKTIF" && (
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
        </div>
      )}
    </div>
  );
}

export default function AdminLabelPage() {
  return (
    <Suspense fallback={null}>
      <AdminLabelPageContent />
    </Suspense>
  );
}
