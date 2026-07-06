"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { TkButton, tkButtonVariants } from "@/components/ui/tk-button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { tkInputClass } from "@/lib/form-style";
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

  async function handleGeneratePdf(t: TransaksiSearchResult) {
    setDownloadingId(t.id);
    try {
      const res = await fetch(`/api/admin/transaksi/${t.id}/generate-pdf`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat PDF perjanjian");

      setResults((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, pdfUrl: result.pdfUrl } : item))
      );
      toast.success("PDF perjanjian berhasil dibuat");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat PDF perjanjian");
    } finally {
      setDownloadingId(null);
    }
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
      <h1 className="text-2xl font-extrabold text-tk-charcoal">Arsip Perjanjian</h1>
      <p className="mt-1 text-sm text-tk-muted">
        Cari dan kelola dokumen perjanjian semua transaksi.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <Input
          placeholder="Cari nama pelanggan atau nomor ref..."
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

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => handleFilterClick(f.value)}
            className={cn(
              "rounded-lg border-2 border-tk-charcoal px-4 py-1.5 text-sm font-bold transition-colors",
              status === f.value ? "bg-tk-charcoal text-tk-cream" : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border-2 border-tk-charcoal">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead className="bg-tk-charcoal text-tk-cream">
            <tr>
              <th className="px-4 py-3 font-bold">Nomor Ref</th>
              <th className="px-4 py-3 font-bold">Nama</th>
              <th className="px-4 py-3 font-bold">Paket</th>
              <th className="px-4 py-3 font-bold">Tanggal</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && results.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-tk-muted">
                  Tidak ada transaksi ditemukan.
                </td>
              </tr>
            )}
            {results.map((t, index) => (
              <tr
                key={t.id}
                className={cn(
                  "border-b border-[#D6CEC4] transition-colors last:border-0 hover:bg-tk-cream-alt",
                  index % 2 === 0 ? "bg-white" : "bg-tk-cream"
                )}
              >
                <td className="px-4 py-3 font-bold text-tk-charcoal">{t.nomorRef}</td>
                <td className="px-4 py-3 text-tk-charcoal">{t.pelanggan.nama}</td>
                <td className="px-4 py-3 text-tk-charcoal">{t.paket.nama}</td>
                <td className="px-4 py-3 text-tk-charcoal">
                  {format(new Date(t.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.statusTransaksi}>
                    {t.statusTransaksi.charAt(0) + t.statusTransaksi.slice(1).toLowerCase()}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {t.pdfUrl ? (
                      <>
                        <TkButton
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleLihatPdf(t.pdfUrl)}
                        >
                          Lihat PDF
                        </TkButton>
                        <TkButton
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={downloadingId === t.id}
                          onClick={() => handleDownloadPdf(t)}
                        >
                          {downloadingId === t.id && (
                            <Loader2 className="mr-1.5 animate-spin" size={14} />
                          )}
                          Download PDF
                        </TkButton>
                      </>
                    ) : (
                      <TkButton
                        type="button"
                        size="sm"
                        variant="primary"
                        disabled={downloadingId === t.id}
                        onClick={() => handleGeneratePdf(t)}
                      >
                        {downloadingId === t.id && (
                          <Loader2 className="mr-1.5 animate-spin" size={14} />
                        )}
                        Generate PDF
                      </TkButton>
                    )}
                    <Link
                      href={`/admin/transaksi/${t.id}`}
                      className={tkButtonVariants({ variant: "secondary", size: "sm" })}
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
