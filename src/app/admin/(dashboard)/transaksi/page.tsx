"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TandaiLunasButton } from "@/components/admin/tandai-lunas-button";
import { Pagination } from "@/components/admin/pagination";
import type { TransaksiSearchResult } from "@/types/transaksi";
import type { Paket } from "@/types/paket";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "AKTIF", label: "Aktif" },
  { value: "SELESAI", label: "Selesai" },
  { value: "DIBATALKAN", label: "Dibatalkan" },
];

const LIMIT = 20;

function getHub(nomorRef: string) {
  return nomorRef.split("-")[1] ?? "-";
}

interface Filters {
  search: string;
  status: string;
  paketId: string;
  page: number;
}

export default function AdminTransaksiPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paketId, setPaketId] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<TransaksiSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [paketOptions, setPaketOptions] = useState<Paket[]>([]);

  useEffect(() => {
    fetch("/api/admin/paket")
      .then((res) => (res.ok ? res.json() : []))
      .then(setPaketOptions)
      .catch(() => {});
  }, []);

  async function fetchData(overrides?: Partial<Filters>) {
    const currentSearch = overrides?.search ?? search;
    const currentStatus = overrides?.status ?? status;
    const currentPaketId = overrides?.paketId ?? paketId;
    const currentPage = overrides?.page ?? page;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (currentStatus) params.set("status", currentStatus);
      if (currentPaketId) params.set("paketId", currentPaketId);
      params.set("page", String(currentPage));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/admin/transaksi?${params.toString()}`);
      if (!res.ok) throw new Error();
      const result: { data: TransaksiSearchResult[]; total: number } = await res.json();
      setData(result.data);
      setTotal(result.total);
    } catch {
      toast.error("Gagal mengambil data transaksi");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchData({ page: 1 });
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setPage(1);
    fetchData({ status: value, page: 1 });
  }

  function handlePaketChange(value: string) {
    const newValue = value === "all" ? "" : value;
    setPaketId(newValue);
    setPage(1);
    fetchData({ paketId: newValue, page: 1 });
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchData({ page: newPage });
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold">Transaksi</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Semua transaksi penitipan barang &middot; {total} total.
      </p>

      <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
        <Input
          placeholder="Cari nama pelanggan atau nomor ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
          Cari
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleStatusChange(f.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                status === f.value
                  ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                  : "border-card-border text-foreground/70 hover:bg-primary/10"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Select value={paketId || "all"} onValueChange={(value) => value && handlePaketChange(value)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Semua Paket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Paket</SelectItem>
            {paketOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card mt-6 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-card-border text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Nomor Ref</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Hub</th>
              <th className="px-4 py-3 font-medium">Tanggal Masuk</th>
              <th className="px-4 py-3 font-medium">Jatuh Tempo</th>
              <th className="px-4 py-3 font-medium">Status Bayar</th>
              <th className="px-4 py-3 font-medium">Status Transaksi</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-foreground/50">
                  Tidak ada transaksi ditemukan.
                </td>
              </tr>
            )}
            {data.map((t) => (
              <tr key={t.id} className="border-b border-card-border last:border-0">
                <td className="px-4 py-3 font-medium">{t.nomorRef}</td>
                <td className="px-4 py-3">{t.pelanggan.nama}</td>
                <td className="px-4 py-3">{t.paket.nama}</td>
                <td className="px-4 py-3">{getHub(t.nomorRef)}</td>
                <td className="px-4 py-3">
                  {format(new Date(t.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
                </td>
                <td className="px-4 py-3">
                  {format(new Date(t.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}
                </td>
                <td className="px-4 py-3">
                  {t.statusBayar === "LUNAS" ? (
                    <span className="text-primary-from">Lunas</span>
                  ) : (
                    <span className="text-accent">Belum Lunas</span>
                  )}
                </td>
                <td className="px-4 py-3 capitalize">{t.statusTransaksi.toLowerCase()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/transaksi/${t.id}`}
                      className="rounded-lg border border-card-border px-3 py-1.5 text-xs hover:bg-primary/10"
                    >
                      Detail
                    </Link>
                    {t.statusBayar === "BELUM_BAYAR" && (
                      <TandaiLunasButton id={t.id} onSuccess={() => fetchData()} />
                    )}
                    <Link
                      href={`/admin/label?transaksiId=${t.id}`}
                      className="rounded-lg border border-card-border px-3 py-1.5 text-xs hover:bg-primary/10"
                    >
                      Print Label
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}
