"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { Input } from "@/components/ui/input";
import { LabelSection } from "@/components/admin/label-section";
import { tkInputClass } from "@/lib/form-style";
import { formatRupiah } from "@/lib/utils";
import { kodeTransaksi } from "@/lib/kode";
import type { TransaksiSearchResult } from "@/types/transaksi";

function AdminLabelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transaksiIdParam = searchParams.get("transaksiId");

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDeepLink, setIsLoadingDeepLink] = useState(!!transaksiIdParam);
  const [results, setResults] = useState<TransaksiSearchResult[]>([]);
  const [selected, setSelected] = useState<TransaksiSearchResult | null>(null);

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
            placeholder="Cari nama pelanggan atau kode TK-XXXX..."
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
                {kodeTransaksi(t.nomorUrut)} &middot; {t.paket.nama}
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
                {selected.paket.nama} &middot; {formatRupiah(selected.hargaPaketTertagih)}
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

          <LabelSection
            key={selected.id}
            transaksi={selected}
            barangLabel={selected.barangLabel}
          />
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
