"use client";

import { FadeIn } from "@/components/shared/fade-in";
import { HUB_CONFIG, JAM_OPERASIONAL_HUB_SUHAT } from "@/lib/constants";

const HUBS = [
  {
    nama: `📍 ${HUB_CONFIG.suhat.nama}`,
    alamat: HUB_CONFIG.suhat.alamat,
    deskripsi:
      "Dekat UB, UM, dan UIN. Pusat kos mahasiswa terpadat di Malang. Cocok untuk storage bulanan dan paket magang.",
    tags: ["Dekat UB", "Dekat UM", "Dekat UIN"],
    aktif: HUB_CONFIG.suhat.aktif,
  },
  {
    nama: `📍 ${HUB_CONFIG.tidar.nama} View`,
    alamat: HUB_CONFIG.tidar.alamat,
    deskripsi:
      "Kawasan perumahan tenang dan aman 24 jam. Cocok untuk motor, barang bernilai tinggi, dan penyimpanan jangka panjang.",
    tags: ["Titip Motor", "Aman 24 Jam", "Jangka Panjang"],
    aktif: HUB_CONFIG.tidar.aktif,
  },
];

export function HubLokasi() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Dua <span className="gradient-text">Hub</span> Strategis di Malang
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {HUBS.map((hub, index) => (
            <FadeIn key={hub.nama} delay={index * 0.1}>
              {hub.aktif ? (
                <div className="glass-card flex h-full flex-col rounded-2xl p-6">
                  <h3 className="font-heading text-lg font-bold">{hub.nama}</h3>
                  <p className="mt-1 text-sm font-medium text-foreground/60">{hub.alamat}</p>
                  <p className="mt-3 flex-1 text-sm text-foreground/70">{hub.deskripsi}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {hub.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-from"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-card relative flex h-full min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-2xl p-6 pointer-events-none select-none">
                  <span className="absolute right-4 top-4 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-300">
                    🔜 Segera Hadir
                  </span>
                  <div className="absolute inset-0 bg-black/50" />
                  <p className="relative z-10 text-center font-heading font-bold text-foreground/80">
                    {hub.nama} — Segera Hadir. Stay tuned!
                  </p>
                </div>
              )}
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div className="glass-card mx-auto mt-8 max-w-md rounded-2xl p-5 text-center text-sm">
            <p className="font-heading font-bold">⏰ Jam Operasional Hub Suhat</p>
            <p className="mt-2 text-foreground/70">{JAM_OPERASIONAL_HUB_SUHAT.hari}</p>
            <p className="text-foreground/70">{JAM_OPERASIONAL_HUB_SUHAT.libur}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
