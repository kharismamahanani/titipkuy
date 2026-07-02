"use client";

import { Shield, Camera, Bike, FileText } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";

const ALASAN = [
  {
    icon: Shield,
    title: "🛡️ Segel Keamanan",
    desc: "Setiap barang disegel dengan numbered cable tie. Jika segel rusak saat pengambilan, kami tanggung.",
  },
  {
    icon: Camera,
    title: "📸 Foto Bukti Masuk & Keluar",
    desc: "Foto kondisi barang didokumentasikan saat masuk dan keluar — tersimpan di database, bisa kamu cek kapan saja.",
  },
  {
    icon: Bike,
    title: "🛵 Antar-Jemput ke Pintumu",
    desc: "Males ke hub? Armada kami yang ke kos/hotel kamu. Motor untuk area sekitar, mobil untuk barang banyak.",
  },
  {
    icon: FileText,
    title: "📄 Surat Perjanjian Digital",
    desc: "Semua transaksi dilindungi surat perjanjian digital yang tersimpan rapi dan bisa diunduh kapan saja.",
  },
];

export function KenapaTitipkuy() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Kenapa <span className="gradient-text">TitipKuy!</span>? 🤔
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {ALASAN.map((item, index) => {
            const Icon = item.icon;
            return (
              <FadeIn key={item.title} delay={index * 0.1}>
                <div className="glass-card flex h-full gap-4 rounded-2xl p-6">
                  <Icon className="mt-1 shrink-0 text-primary-from" size={28} />
                  <div>
                    <h3 className="font-heading font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm text-foreground/70">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
