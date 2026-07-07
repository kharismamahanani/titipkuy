"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { TkButton, tkButtonVariants } from "@/components/ui/tk-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { tkInputClass, tkSelectTriggerClass } from "@/lib/form-style";
import { StatusBadge } from "@/components/ui/status-badge";
import { TandaiLunasButton } from "@/components/admin/tandai-lunas-button";
import { Pagination } from "@/components/admin/pagination";
import { kodeTransaksi } from "@/lib/kode";
import type { TransaksiSearchResult } from "@/types/transaksi";
import type { Paket } from "@/types/paket";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "AKTIF", label: "Aktif" },
  { value: "SELESAI", label: "Selesai" },
  { value: "DIBATALKAN", label: "Dibatalkan" },
];

const LIMIT = 20;

function getHub(t: TransaksiSearchResult) {
  return t.hub ?? "-";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-tk-charcoal">Transaksi</h1>
          <p className="mt-1 text-sm text-tk-muted">
            Semua transaksi penitipan barang &middot; {total} total.
          </p>
        </div>
        <Link href="/admin/transaksi/baru" className={tkButtonVariants({ variant: "primary", size: "md" })}>
          + Buat Order Manual
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
        <Input
          placeholder="Cari nama pelanggan atau kode TK-XXXX..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={tkInputClass}
        />
        <TkButton type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-1.5 animate-spin" size={16} />
          ) : (
            <Search className="mr-1.5" size={16} />
          )}
          Cari
        </TkButton>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleStatusChange(f.value)}
              className={cn(
                "rounded-lg border-2 border-tk-charcoal px-4 py-1.5 text-sm font-bold transition-colors",
                status === f.value ? "bg-tk-charcoal text-tk-cream" : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Select value={paketId || "all"} onValueChange={(value) => value && handlePaketChange(value)}>
          <SelectTrigger className={cn(tkSelectTriggerClass, "w-full sm:w-52")}>
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

      <div className="mt-6 overflow-x-auto rounded-lg border-2 border-tk-charcoal">
        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
          <thead className="bg-tk-charcoal text-tk-cream">
            <tr>
              <th className="px-4 py-3 font-bold">Kode</th>
              <th className="px-4 py-3 font-bold">Nama</th>
              <th className="px-4 py-3 font-bold">Paket</th>
              <th className="px-4 py-3 font-bold">Hub</th>
              <th className="px-4 py-3 font-bold">Tanggal Masuk</th>
              <th className="px-4 py-3 font-bold">Jatuh Tempo</th>
              <th className="px-4 py-3 font-bold">Status Bayar</th>
              <th className="px-4 py-3 font-bold">Status Transaksi</th>
              <th className="px-4 py-3 font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-tk-muted">
                  Tidak ada transaksi ditemukan.
                </td>
              </tr>
            )}
            {data.map((t, index) => (
              <tr
                key={t.id}
                className={cn(
                  "border-b border-[#D6CEC4] transition-colors last:border-0 hover:bg-tk-cream-alt",
                  index % 2 === 0 ? "bg-white" : "bg-tk-cream"
                )}
              >
                <td className="px-4 py-3 font-bold text-tk-charcoal">
                  {kodeTransaksi(t.nomorUrut)}
                </td>
                <td className="px-4 py-3 text-tk-charcoal">{t.pelanggan.nama}</td>
                <td className="px-4 py-3 text-tk-charcoal">{t.paket.nama}</td>
                <td className="px-4 py-3 capitalize text-tk-charcoal">{getHub(t)}</td>
                <td className="px-4 py-3 text-tk-charcoal">
                  {format(new Date(t.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
                </td>
                <td className="px-4 py-3 text-tk-charcoal">
                  {format(new Date(t.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.statusBayar}>
                    {t.statusBayar === "LUNAS" ? "Lunas" : "Belum Lunas"}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.statusTransaksi}>
                    {t.statusTransaksi.charAt(0) + t.statusTransaksi.slice(1).toLowerCase()}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/transaksi/${t.id}`}
                      className={tkButtonVariants({ variant: "secondary", size: "sm" })}
                    >
                      Detail
                    </Link>
                    <TandaiLunasButton
                      id={t.id}
                      nomorUrut={t.nomorUrut}
                      pelanggan={t.pelanggan}
                      paket={t.paket}
                      antarJemputHarga={t.antarJemputOption?.harga}
                      tanggalJatuhTempo={t.tanggalJatuhTempo}
                      statusBayar={t.statusBayar}
                      onSuccess={() => fetchData()}
                    />
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
