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
