"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/admin/stat-card";
import { OmzetBarChart } from "@/components/admin/rekap/omzet-bar-chart";
import { TrenAreaChart } from "@/components/admin/rekap/tren-area-chart";
import { ProfitCalculator } from "@/components/admin/rekap/profit-calculator";
import { WithdrawalHistory } from "@/components/admin/rekap/withdrawal-history";
import { formatRupiah } from "@/lib/utils";
import type { PengambilanLaba, RekapData } from "@/types/rekap";

const LOCAL_STORAGE_KEY = "titipkuy_pengambilan_laba";

export default function AdminRekapPage() {
  const [bulan, setBulan] = useState(() => format(new Date(), "yyyy-MM"));
  const [data, setData] = useState<RekapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pengambilanList, setPengambilanList] = useState<PengambilanLaba[]>([]);

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

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Rekap Keuangan</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Ringkasan omzet, tren, dan kalkulator pembagian laba.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bulan">Pilih Bulan</Label>
          <Input
            id="bulan"
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <Loader2 className="animate-spin" size={16} />
          Memuat data rekap...
        </div>
      )}

      {!isLoading && !data && (
        <p className="text-sm text-foreground/60">
          Data belum bisa dimuat. Database mungkin belum terhubung.
        </p>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Omzet Bulan Ini" value={formatRupiah(data.omzetBulanIni)} />
            <StatCard label="Jumlah Transaksi" value={String(data.jumlahTransaksi)} />
            <StatCard
              label="Rata-rata per Transaksi"
              value={formatRupiah(data.rataRataPerTransaksi)}
            />
            <StatCard
              label="Belum Dibayar"
              value={formatRupiah(data.totalBelumDibayar)}
              danger={data.totalBelumDibayar > 0}
            />
          </div>

          <section className="glass-card space-y-3 rounded-2xl p-5">
            <h2 className="font-heading font-bold">Omzet per Paket</h2>
            <OmzetBarChart data={data.breakdownPaket} />
          </section>

          <section className="glass-card space-y-3 rounded-2xl p-5">
            <h2 className="font-heading font-bold">Tren 6 Bulan Terakhir</h2>
            <TrenAreaChart data={data.tren6Bulan} />
          </section>

          <ProfitCalculator
            omzetBulanIni={data.omzetBulanIni}
            bulan={bulan}
            onSavePengambilan={handleSavePengambilan}
          />

          <section className="space-y-3">
            <h2 className="font-heading font-bold">Riwayat Pengambilan</h2>
            <WithdrawalHistory data={pengambilanList} onDelete={handleDeletePengambilan} />
          </section>
        </>
      )}
    </div>
  );
}
