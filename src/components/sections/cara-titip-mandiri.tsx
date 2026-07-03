"use client";

import { FadeIn } from "@/components/shared/fade-in";
import { JAM_DROP_OFF_MANDIRI } from "@/lib/constants";

const STEPS = [
  {
    icon: "1️⃣",
    text: "Isi form pemesanan di website — Kode Unik langsung muncul di halaman konfirmasi setelah submit. Catat atau screenshot kodenya (contoh: LELY-089).",
  },
  {
    icon: "2️⃣",
    text: "Tulis kode itu dengan spidol besar di luar kardus/koper.",
  },
  {
    icon: "3️⃣",
    text: `Pesan Grab/Lalamove atau datang langsung ke Hub Suhat pada: 📍 Jam Drop-Off: ${JAM_DROP_OFF_MANDIRI} (di luar jam ini hub bisa sedang tidak ada pegawai).`,
  },
  {
    icon: "4️⃣",
    text: "Pegawai memotret kondisi barang saat diterima.",
  },
  {
    icon: "5️⃣",
    text: "Pegawai memasang label bernomor seri pada kardus/koper.",
  },
  {
    icon: "6️⃣",
    text: "Nomor label dikirim ke WhatsApp kamu sebagai bukti ✅",
  },
];

export function CaraTitipMandiri() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <FadeIn className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Kirim Sendiri via <span className="gradient-text">Grab/Lalamove</span> atau Datang
            Langsung 📦
          </h2>
        </FadeIn>

        <div className="mt-12 space-y-4">
          {STEPS.map((step, index) => (
            <FadeIn key={step.text} delay={index * 0.08}>
              <div className="glass-card flex items-start gap-4 rounded-2xl p-5">
                <span className="text-2xl">{step.icon}</span>
                <p className="pt-1 text-sm text-foreground/80">{step.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.1}>
          <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm text-yellow-200">
            📦 Kirim dari luar kota via ekspedisi (JNE, J&amp;T, dll)? Tulis Kode Unik di luar
            paket dan sertakan kertas kecil berisi nama + no. HP di dalam paket. Hubungi admin
            via WhatsApp setelah paket dikirim agar bisa dipantau kedatangannya.
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm text-yellow-200">
            💡 Drop-off mandiri tidak perlu booking slot armada. Cukup isi form web, dapat
            kode unik, dan datang/kirim pada jam drop-off di atas.
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
