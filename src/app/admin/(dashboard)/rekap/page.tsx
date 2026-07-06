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
import { KategoriTabs, PengeluaranForm } from "@/components/admin/rekap/pengeluaran-form";
import { PengeluaranTable } from "@/components/admin/rekap/pengeluaran-table";
import { BepTrackerCard } from "@/components/admin/rekap/bep-tracker-card";
import { ModalAwalSection } from "@/components/admin/rekap/modal-awal-section";
import { AlokasiLabaCard } from "@/components/admin/rekap/alokasi-laba-card";
import { cn, formatRupiah } from "@/lib/utils";
import { KATEGORI_PENGELUARAN } from "@/lib/pengeluaran";
import type { KategoriPengeluaran } from "@/lib/pengeluaran";
import type {
  KonfigurasiKeuangan,
  ModalAwal,
  PengambilanLaba,
  Pengeluaran,
  RekapData,
} from "@/types/rekap";

const LOCAL_STORAGE_KEY = "titipkuy_pengambilan_laba";

export default function AdminRekapPage() {
  const [bulan, setBulan] = useState(() => format(new Date(), "yyyy-MM"));
  const [data, setData] = useState<RekapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pengambilanList, setPengambilanList] = useState<PengambilanLaba[]>([]);
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([]);
  const [isLoadingPengeluaran, setIsLoadingPengeluaran] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState<KategoriPengeluaran>(
    KATEGORI_PENGELUARAN[0].value
  );
  const [modalAwalList, setModalAwalList] = useState<ModalAwal[]>([]);
  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiKeuangan | null>(null);

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

  function fetchRekap() {
    setIsLoading(true);
    return fetch(`/api/admin/rekap?bulan=${bulan}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result: RekapData) => setData(result))
      .catch(() => toast.error("Gagal mengambil data rekap"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchRekap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    fetch("/api/admin/modal-awal")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result: ModalAwal[]) => setModalAwalList(result))
      .catch(() => toast.error("Gagal mengambil data modal awal"));

    fetch("/api/admin/konfigurasi-keuangan")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result: KonfigurasiKeuangan) => setKonfigurasi(result))
      .catch(() => toast.error("Gagal mengambil konfigurasi keuangan"));
  }, []);

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
    // BEP tracker dihitung server-side dari akumulasi SEMUA pengeluaran
    // (bukan hanya bulan terpilih), jadi perlu di-refresh juga di sini.
    fetchRekap();
  }

  async function handleDeletePengeluaran(id: string) {
    try {
      const res = await fetch(`/api/admin/pengeluaran/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPengeluaranList((prev) => prev.filter((item) => item.id !== id));
      fetchRekap();
      toast.success("Pengeluaran dihapus");
    } catch {
      toast.error("Gagal menghapus pengeluaran");
    }
  }

  function handleModalAwalSaved(item: ModalAwal) {
    setModalAwalList((prev) => [item, ...prev]);
    fetchRekap();
  }

  function handleModalAwalDeleted(id: string) {
    setModalAwalList((prev) => prev.filter((item) => item.id !== id));
    fetchRekap();
  }

  const pengeluaranBulanIni = pengeluaranList.reduce((sum, p) => sum + p.jumlah, 0);
  const pengeluaranKategoriAktif = pengeluaranList.filter((p) => p.kategori === kategoriAktif);
  const labaBersihBulanIni = (data?.omzetBulanIni ?? 0) - pengeluaranBulanIni;
  const marginBulanIni =
    data && data.omzetBulanIni > 0 ? (labaBersihBulanIni / data.omzetBulanIni) * 100 : 0;

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-tk-charcoal">Rekap Keuangan</h1>
          <p className="mt-1 text-sm text-tk-muted">
            Ringkasan omzet, BEP tracker, pengeluaran, dan alokasi laba.
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
          {/* SECTION 1 — Ringkasan Bulan Ini */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Omzet Bulan Ini" value={formatRupiah(data.omzetBulanIni)} accent="orange" />
            <StatCard
              label="Pengeluaran Total"
              value={formatRupiah(pengeluaranBulanIni)}
              danger={pengeluaranBulanIni > 0}
            />
            <StatCard
              label="Laba Bersih"
              value={formatRupiah(labaBersihBulanIni)}
              accent={labaBersihBulanIni >= 0 ? "sage" : undefined}
              danger={labaBersihBulanIni < 0}
            />
            <StatCard label="Margin" value={`${marginBulanIni.toFixed(1)}%`} accent="charcoal" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          {/* SECTION 2 — BEP Tracker */}
          <BepTrackerCard data={data.bepTracker} />

          <section className="space-y-3 rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]">
            <h2 className="font-extrabold text-tk-charcoal">Omzet per Paket</h2>
            <OmzetBarChart data={data.breakdownPaket} />
          </section>

          <section className="space-y-3 rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]">
            <h2 className="font-extrabold text-tk-charcoal">Tren 6 Bulan Terakhir</h2>
            <TrenAreaChart data={data.tren6Bulan} />
          </section>

          <section className="space-y-3 rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]">
            <h2 className="font-extrabold text-tk-charcoal">Omzet vs Pengeluaran (6 Bulan)</h2>
            <OmzetVsPengeluaranChart omzet={data.tren6Bulan} pengeluaran={data.tren6BulanPengeluaran} />
          </section>

          {/* SECTION 3 — Pencatatan Pengeluaran */}
          <section className="space-y-5 rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]">
            <div>
              <h2 className="font-extrabold text-tk-charcoal">Pencatatan Pengeluaran</h2>
              <p className="mt-1 text-sm text-tk-muted">
                Catat pengeluaran per kategori untuk menghitung laba bersih dan progress BEP.
              </p>
            </div>

            <KategoriTabs active={kategoriAktif} onChange={setKategoriAktif} />

            <PengeluaranForm activeKategori={kategoriAktif} onSaved={handlePengeluaranSaved} />

            {isLoadingPengeluaran ? (
              <div className="flex items-center gap-2 text-sm text-tk-muted">
                <Loader2 className="animate-spin" size={16} />
                Memuat pengeluaran...
              </div>
            ) : (
              <PengeluaranTable data={pengeluaranKategoriAktif} onDelete={handleDeletePengeluaran} />
            )}

            <div className="grid gap-2 rounded-lg border-2 border-tk-charcoal bg-tk-cream-alt p-4 text-sm sm:grid-cols-3">
              {KATEGORI_PENGELUARAN.map((k) => {
                const totalKategori = pengeluaranList
                  .filter((p) => p.kategori === k.value)
                  .reduce((sum, p) => sum + p.jumlah, 0);
                return (
                  <div key={k.value} className="flex justify-between">
                    <span className="text-tk-muted">
                      {k.icon} {k.label}
                    </span>
                    <span className="font-bold text-tk-charcoal">{formatRupiah(totalKategori)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 4 — Modal Awal */}
          <section className="space-y-3 rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]">
            <div>
              <h2 className="font-extrabold text-tk-charcoal">Modal Awal</h2>
              <p className="mt-1 text-sm text-tk-muted">
                Item modal awal usaha — dipakai sebagai target di BEP Tracker.
              </p>
            </div>
            <ModalAwalSection
              data={modalAwalList}
              onSaved={handleModalAwalSaved}
              onDeleted={handleModalAwalDeleted}
            />
          </section>

          {/* SECTION 5 — Alokasi Laba */}
          {konfigurasi && (
            <AlokasiLabaCard
              labaBulanIni={labaBersihBulanIni}
              konfigurasi={konfigurasi}
              bepTercapai={data.bepTracker.bepTercapai}
              onSaved={setKonfigurasi}
            />
          )}

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
