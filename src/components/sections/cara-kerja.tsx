"use client";

import { FileText, QrCode, Truck, Camera } from "lucide-react";
import { TkCard } from "@/components/ui/tk-card";

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
    <section id="cara-kerja" className="bg-tk-cream px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold text-tk-charcoal">Cara Kerjanya 🔑</h2>
          <p className="mt-3 text-tk-muted">Gampang, cuma 4 langkah.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <TkCard key={step.title} className="flex h-full flex-col items-center gap-3 text-center">
                <span className="text-4xl font-extrabold text-tk-orange">{index + 1}</span>
                <Icon className="text-tk-charcoal" size={30} />
                <h3 className="font-extrabold text-tk-charcoal">{step.title}</h3>
                <p className="text-sm text-tk-muted">{step.desc}</p>
              </TkCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
