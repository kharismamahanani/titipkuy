"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TransaksiSearchResult } from "@/types/transaksi";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "AKTIF", label: "Aktif" },
  { value: "SELESAI", label: "Selesai" },
  { value: "DIBATALKAN", label: "Dibatalkan" },
];

export default function AdminArsipPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<TransaksiSearchResult[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function fetchData(currentSearch: string, currentStatus: string) {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (currentStatus) params.set("status", currentStatus);

      const res = await fetch(`/api/admin/arsip?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data: TransaksiSearchResult[] = await res.json();
      setResults(data);
    } catch {
      toast.error("Gagal mengambil data arsip");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchData(search, status);
  }

  function handleFilterClick(value: string) {
    setStatus(value);
    fetchData(search, value);
  }

  function handleLihatPdf(pdfUrl: string | null) {
    if (!pdfUrl) {
      toast.error("PDF perjanjian belum tersedia untuk transaksi ini");
      return;
    }
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  async function handleDownloadPdf(t: TransaksiSearchResult) {
    if (!t.pdfUrl) {
      toast.error("PDF perjanjian belum tersedia untuk transaksi ini");
      return;
    }

    setDownloadingId(t.id);
    try {
      const res = await fetch(t.pdfUrl);
      if (!res.ok) throw new Error();
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Perjanjian-${t.nomorRef}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengunduh PDF");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold">Arsip Perjanjian</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Cari dan kelola dokumen perjanjian semua transaksi.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
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

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => handleFilterClick(f.value)}
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

      <div className="glass-card mt-6 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-card-border text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Nomor Ref</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && results.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
                  Tidak ada transaksi ditemukan.
                </td>
              </tr>
            )}
            {results.map((t) => (
              <tr key={t.id} className="border-b border-card-border last:border-0">
                <td className="px-4 py-3 font-medium">{t.nomorRef}</td>
                <td className="px-4 py-3">{t.pelanggan.nama}</td>
                <td className="px-4 py-3">{t.paket.nama}</td>
                <td className="px-4 py-3">
                  {format(new Date(t.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
                </td>
                <td className="px-4 py-3 capitalize">{t.statusTransaksi.toLowerCase()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleLihatPdf(t.pdfUrl)}
                    >
                      Lihat PDF
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={downloadingId === t.id}
                      onClick={() => handleDownloadPdf(t)}
                    >
                      {downloadingId === t.id && (
                        <Loader2 className="animate-spin" size={14} />
                      )}
                      Download PDF
                    </Button>
                    <Link
                      href={`/admin/transaksi/${t.id}`}
                      className="rounded-lg border border-card-border px-3 py-1.5 text-xs hover:bg-primary/10"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
