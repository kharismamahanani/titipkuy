"use client";

import { FadeIn } from "@/components/shared/fade-in";

const HUBS = [
  {
    nama: "📍 Hub Suhat",
    alamat: "Jl. Bunga Lely, Lowokwaru",
    deskripsi:
      "Dekat UB, UM, dan UIN. Pusat kos mahasiswa terpadat di Malang. Cocok untuk storage bulanan dan paket magang.",
    tags: ["Dekat UB", "Dekat UM", "Dekat UIN"],
  },
  {
    nama: "📍 Hub Tidar",
    alamat: "Perum Tidar View, Sukun",
    deskripsi:
      "Kawasan perumahan tenang dan aman 24 jam. Cocok untuk motor, barang bernilai tinggi, dan penyimpanan jangka panjang.",
    tags: ["Titip Motor", "Aman 24 Jam", "Jangka Panjang"],
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
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
