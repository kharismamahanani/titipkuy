"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupiah } from "@/lib/utils";
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

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold">Print Label</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Cari transaksi, tambahkan barang, lalu cetak label.
      </p>

      {isLoadingDeepLink && (
        <p className="mt-6 flex items-center gap-2 text-sm text-foreground/60">
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
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            Cari
          </Button>
        </form>
      )}

      {!selected && results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t)}
              className="glass-card block w-full rounded-xl p-4 text-left hover:scale-[1.01]"
            >
              <p className="font-medium">{t.pelanggan.nama}</p>
              <p className="text-xs text-foreground/60">
                {t.nomorRef} &middot; {t.paket.nama}
              </p>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-6 space-y-6">
          <div className="glass-card space-y-2 rounded-2xl p-5 text-sm">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setSelected(null);
                if (transaksiIdParam) router.replace("/admin/label");
              }}
            >
              &larr; Cari transaksi lain
            </Button>
            <div className="flex justify-between pt-2">
              <span className="text-foreground/60">Nama</span>
              <span className="font-medium">{selected.pelanggan.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Paket</span>
              <span className="font-medium">
                {selected.paket.nama} &middot; {formatRupiah(selected.paket.harga)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Masuk</span>
              <span className="font-medium">
                {format(new Date(selected.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Jatuh Tempo</span>
              <span className="font-medium">
                {format(new Date(selected.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}
              </span>
            </div>
          </div>

          <form onSubmit={handleAddBarang} className="glass-card space-y-3 rounded-2xl p-5">
            <p className="text-sm font-semibold">Tambah Barang</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <div className="space-y-2">
                <Label htmlFor="deskripsiBarang">Deskripsi Barang</Label>
                <Input
                  id="deskripsiBarang"
                  placeholder="Kardus 1 - Pakaian"
                  value={deskripsiBarang}
                  onChange={(e) => setDeskripsiBarang(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategoriBarang">Kategori</Label>
                <Select
                  value={kategoriBarang}
                  onValueChange={(value) => value && setKategoriBarang(value)}
                >
                  <SelectTrigger id="kategoriBarang" className="w-full">
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
              <Button
                type="submit"
                disabled={isAdding}
                className="self-end bg-gradient-to-r from-primary-from to-primary-to text-white"
              >
                {isAdding && <Loader2 className="animate-spin" size={14} />}
                Tambah
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-heading font-bold">
                Daftar Barang ({selected.barangLabel.length})
              </p>
              <Button
                type="button"
                disabled={selected.barangLabel.length === 0}
                onClick={handlePrint}
                className="bg-gradient-to-r from-primary-from to-primary-to text-white"
              >
                Print Semua Label
              </Button>
            </div>

            {selected.barangLabel.length === 0 ? (
              <p className="text-sm text-foreground/50">Belum ada barang ditambahkan.</p>
            ) : (
              <div className="glass-card divide-y divide-card-border rounded-2xl">
                {selected.barangLabel.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{b.deskripsi}</p>
                      <p className="text-xs text-foreground/60 capitalize">{b.kategori}</p>
                    </div>
                    <span className="gradient-text font-heading font-bold">{b.kodeLabel}</span>
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
