"use client";

import { FileText, QrCode, Truck, Camera } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";

const STEPS = [
  {
    icon: FileText,
    title: "Isi Form Online",
    desc: "Pilih paket, isi data diri, tanda tangan digital. Cuma 3 menit.",
  },
  {
    icon: QrCode,
    title: "Bayar & Dapat Kode Unik",
    desc: "Bayar via QRIS/transfer. Kamu dapat kode unik untuk label barangmu.",
  },
  {
    icon: Truck,
    title: "Jemput atau Antar Sendiri",
    desc: "Pilih armada kami jemput ke kos, atau antar sendiri ke Hub Suhat pada jam drop-off (08.00–10.00 / 15.00–17.00 WIB).",
  },
  {
    icon: Camera,
    title: "Barang Aman, Ada Fotonya",
    desc: "Foto kondisi barang dikirim ke WA kamu saat masuk dan saat kamu ambil. Transparan dan terdokumentasi.",
  },
];

export function CaraKerja() {
  return (
    <section id="cara-kerja" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Cara <span className="gradient-text">Kerja</span>nya
          </h2>
          <p className="mt-3 text-foreground/70">Gampang, cuma 4 langkah.</p>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <FadeIn key={step.title} delay={index * 0.1}>
                <div className="glass-card flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary-from to-primary-to text-lg font-extrabold text-white">
                    {index + 1}
                  </span>
                  <Icon className="text-primary-from" size={32} />
                  <h3 className="font-heading font-bold">{step.title}</h3>
                  <p className="text-sm text-foreground/70">{step.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
