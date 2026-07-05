"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";
import { StatCard } from "@/components/admin/stat-card";
import { OmzetBarChart } from "@/components/admin/rekap/omzet-bar-chart";
import { TrenAreaChart } from "@/components/admin/rekap/tren-area-chart";
import { OmzetVsPengeluaranChart } from "@/components/admin/rekap/omzet-vs-pengeluaran-chart";
import { ProfitCalculator } from "@/components/admin/rekap/profit-calculator";
import { WithdrawalHistory } from "@/components/admin/rekap/withdrawal-history";
import { PengeluaranForm } from "@/components/admin/rekap/pengeluaran-form";
import { PengeluaranTable } from "@/components/admin/rekap/pengeluaran-table";
import { LabaBersihCard } from "@/components/admin/rekap/laba-bersih-card";
import { cn, formatRupiah } from "@/lib/utils";
import type { PengambilanLaba, Pengeluaran, RekapData } from "@/types/rekap";

const LOCAL_STORAGE_KEY = "titipkuy_pengambilan_laba";

export default function AdminRekapPage() {
  const [bulan, setBulan] = useState(() => format(new Date(), "yyyy-MM"));
  const [data, setData] = useState<RekapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pengambilanList, setPengambilanList] = useState<PengambilanLaba[]>([]);
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([]);
  const [isLoadingPengeluaran, setIsLoadingPengeluaran] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setPengambilanList(JSON.parse(stored));
      } catch {
        // biarkan kosong jika data tersimpan rusak
      }
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/rekap?bulan=${bulan}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result: RekapData) => setData(result))
      .catch(() => toast.error("Gagal mengambil data rekap"))
      .finally(() => setIsLoading(false));
  }, [bulan]);

  useEffect(() => {
    const [tahun, bulanAngka] = bulan.split("-").map(Number);
    setIsLoadingPengeluaran(true);
    fetch(`/api/admin/pengeluaran?bulan=${bulanAngka}&tahun=${tahun}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result: Pengeluaran[]) => setPengeluaranList(result))
      .catch(() => toast.error("Gagal mengambil data pengeluaran"))
      .finally(() => setIsLoadingPengeluaran(false));
  }, [bulan]);

  function persistPengambilan(list: PengambilanLaba[]) {
    setPengambilanList(list);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  }

  function handleSavePengambilan(jumlah: number) {
    const entry: PengambilanLaba = {
      id: crypto.randomUUID(),
      bulan,
      jumlah,
      dicatatPada: new Date().toISOString(),
    };
    persistPengambilan([...pengambilanList, entry]);
  }

  function handleDeletePengambilan(id: string) {
    persistPengambilan(pengambilanList.filter((item) => item.id !== id));
  }

  function handlePengeluaranSaved(pengeluaran: Pengeluaran) {
    setPengeluaranList((prev) => [pengeluaran, ...prev]);
  }

  async function handleDeletePengeluaran(id: string) {
    try {
      const res = await fetch(`/api/admin/pengeluaran/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPengeluaranList((prev) => prev.filter((item) => item.id !== id));
      toast.success("Pengeluaran dihapus");
    } catch {
      toast.error("Gagal menghapus pengeluaran");
    }
  }

  const pengeluaranBulanIni = pengeluaranList.reduce((sum, p) => sum + p.jumlah, 0);

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-tk-charcoal">Rekap Keuangan</h1>
          <p className="mt-1 text-sm text-tk-muted">
            Ringkasan omzet, tren, dan kalkulator pembagian laba.
          </p>
        </div>
        <div>
          <Label htmlFor="bulan" className={tkLabelClass}>
            Pilih Bulan
          </Label>
          <Input
            id="bulan"
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className={cn(tkInputClass, "w-40")}
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-tk-muted">
          <Loader2 className="animate-spin" size={16} />
          Memuat data rekap...
        </div>
      )}

      {!isLoading && !data && (
        <p className="text-sm text-tk-muted">
          Data belum bisa dimuat. Database mungkin belum terhubung.
        </p>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Omzet Bulan Ini" value={formatRupiah(data.omzetBulanIni)} accent="orange" />
            <StatCard label="Jumlah Transaksi" value={String(data.jumlahTransaksi)} accent="sage" />
            <StatCard
              label="Rata-rata per Transaksi"
              value={formatRupiah(data.rataRataPerTransaksi)}
              accent="charcoal"
            />
            <StatCard
              label="Belum Dibayar"
              value={formatRupiah(data.totalBelumDibayar)}
              danger={data.totalBelumDibayar > 0}
            />
          </div>

          <section className="space-y-3 rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]">
            <h2 className="font-extrabold text-tk-charcoal">Omzet per Paket</h2>
            <OmzetBarChart data={data.breakdownPaket} />
          </section>

          <section className="space-y-3 rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]">
            <h2 className="font-extrabold text-tk-charcoal">Tren 6 Bulan Terakhir</h2>
            <TrenAreaChart data={data.tren6Bulan} />
          </section>

          <section className="space-y-5 rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]">
            <div>
              <h2 className="font-extrabold text-tk-charcoal">Pengeluaran Operasional</h2>
              <p className="mt-1 text-sm text-tk-muted">
                Catat pengeluaran harian (bensin, label, packaging, dll) untuk menghitung laba
                bersih.
              </p>
            </div>

            <PengeluaranForm onSaved={handlePengeluaranSaved} />

            {isLoadingPengeluaran ? (
              <div className="flex items-center gap-2 text-sm text-tk-muted">
                <Loader2 className="animate-spin" size={16} />
                Memuat pengeluaran...
              </div>
            ) : (
              <PengeluaranTable data={pengeluaranList} onDelete={handleDeletePengeluaran} />
            )}

            <LabaBersihCard
              bulan={bulan}
              omzet={data.omzetBulanIni}
              pengeluaran={pengeluaranBulanIni}
            />

            <div>
              <h3 className="mb-3 font-extrabold text-tk-charcoal">Omzet vs Pengeluaran (6 Bulan)</h3>
              <OmzetVsPengeluaranChart
                omzet={data.tren6Bulan}
                pengeluaran={data.tren6BulanPengeluaran}
              />
            </div>
          </section>

          <ProfitCalculator
            omzetBulanIni={data.omzetBulanIni}
            bulan={bulan}
            onSavePengambilan={handleSavePengambilan}
          />

          <section className="space-y-3">
            <h2 className="font-extrabold text-tk-charcoal">Riwayat Pengambilan</h2>
            <WithdrawalHistory data={pengambilanList} onDelete={handleDeletePengambilan} />
          </section>
        </>
      )}
    </div>
  );
}
