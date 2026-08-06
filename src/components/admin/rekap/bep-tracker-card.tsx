"use client";

import { useEffect, useState } from "react";
import { TkCard } from "@/components/ui/tk-card";
import { formatRupiah } from "@/lib/utils";
import type { BepTracker } from "@/types/rekap";

function progressColor(percent: number) {
  if (percent >= 100) return "#7FA99B";
  if (percent >= 67) return "#F5E642";
  if (percent >= 34) return "#E89C65";
  return "#C00000";
}

export function BepTrackerCard({ data }: { data: BepTracker }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const percent = Math.round(data.progressPercent);
  const isDone = data.bepTercapai;

  useEffect(() => {
    if (isDone && data.totalModalAwal > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isDone, data.totalModalAwal]);

  return (
    <TkCard className="relative space-y-4 overflow-hidden">
      {showConfetti && <Confetti />}

      <h2 className="font-extrabold text-tk-charcoal">📊 Progress Balik Modal</h2>

      {data.totalModalAwal === 0 ? (
        <p className="text-sm text-tk-muted">
          Belum ada modal awal dicatat. Tambahkan di section &quot;Modal Awal&quot; di bawah
          untuk mengaktifkan BEP tracker.
        </p>
      ) : (
        <>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              Modal Awal:{" "}
              <span className="font-bold text-tk-charcoal">
                {formatRupiah(data.totalModalAwal)}
              </span>
            </p>
            <p>
              Sudah kembali:{" "}
              <span className="font-bold text-tk-charcoal">
                {formatRupiah(data.sudahKembali)}
              </span>{" "}
              <span className="text-tk-muted">(dari laba)</span>
            </p>
          </div>

          <div className="h-6 w-full overflow-hidden rounded-full border-2 border-tk-charcoal bg-white">
            <div
              className="flex h-full items-center justify-end pr-2 text-[10px] font-bold text-tk-charcoal transition-all"
              style={{ width: `${Math.max(percent, 6)}%`, backgroundColor: progressColor(percent) }}
            >
              {percent}%
            </div>
          </div>

          <div className="grid gap-1 text-sm sm:grid-cols-2">
            <p>
              Sisa: <span className="font-bold text-tk-charcoal">{formatRupiah(data.sisaModal)}</span>
            </p>
            <p>
              Estimasi BEP:{" "}
              <span className="font-bold text-tk-charcoal">
                {isDone
                  ? "Sudah tercapai 🎉"
                  : data.estimasiBulanBEP != null
                    ? `${data.estimasiBulanBEP} bulan lagi`
                    : "Belum bisa diestimasi"}
              </span>
            </p>
          </div>
          <p className="text-[11px] text-tk-light">
            (berdasarkan rata-rata laba 3 bulan terakhir: {formatRupiah(data.rataLaba3Bulan)}/bulan)
          </p>

          <details className="rounded-lg border-2 border-dashed border-tk-charcoal/30 bg-tk-cream-alt p-3 text-xs text-tk-charcoal">
            <summary className="cursor-pointer font-bold text-tk-muted">
              Lihat rumus & rincian angka
            </summary>
            <div className="mt-2 space-y-1.5">
              <p className="font-mono">
                Sudah kembali = MIN(MAX(Penerimaan − Pengeluaran, 0), Modal Awal)
              </p>
              <div className="grid gap-1 pl-3 sm:grid-cols-2">
                <p>
                  Total Penerimaan (sepanjang waktu):{" "}
                  <span className="font-bold">{formatRupiah(data.totalPenerimaan)}</span>
                </p>
                <p>
                  Total Pengeluaran (sepanjang waktu):{" "}
                  <span className="font-bold">{formatRupiah(data.totalPengeluaran)}</span>
                </p>
                <p>
                  Laba Kumulatif (Penerimaan − Pengeluaran):{" "}
                  <span className="font-bold">{formatRupiah(data.labaKumulatif)}</span>
                </p>
                <p>
                  Modal Awal (target balik modal):{" "}
                  <span className="font-bold">{formatRupiah(data.totalModalAwal)}</span>
                </p>
              </div>
              <p className="pt-1 text-tk-light">
                Penerimaan = total omzet transaksi berstatus Lunas sejak awal usaha (harga paket +
                premi ganti rugi + antar-jemput). Pengeluaran = seluruh catatan pengeluaran
                operasional sejak awal usaha. Kalau laba kumulatif sudah melebihi modal awal,
                &quot;Sudah kembali&quot; dibatasi maksimal sebesar modal awal — sisanya jadi laba
                bersih, bukan progress balik modal lagi.
              </p>
            </div>
          </details>
        </>
      )}
    </TkCard>
  );
}

const CONFETTI_COLORS = ["#E89C65", "#7FA99B", "#F5E642", "#C0392B", "#3D4A41"];

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute top-[-10px] h-2 w-2 rounded-sm confetti-piece"
          style={{
            left: `${(i * 97) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 6) * 0.12}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(220px) rotate(360deg); opacity: 0; }
        }
        .confetti-piece { animation: confetti-fall 1.8s ease-in forwards; }
      `}</style>
    </div>
  );
}
