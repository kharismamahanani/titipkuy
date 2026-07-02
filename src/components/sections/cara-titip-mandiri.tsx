"use client";

import { FadeIn } from "@/components/shared/fade-in";

const STEPS = [
  {
    icon: "1️⃣",
    text: "Isi formulir pemesanan di website kami terlebih dahulu.",
  },
  {
    icon: "2️⃣",
    text: "Admin mengirim Kode Unik barangmu via WhatsApp (contoh: LELY-042).",
  },
  {
    icon: "3️⃣",
    text: "Tulis kode itu dengan spidol besar di luar kardus/koper.",
  },
  {
    icon: "4️⃣",
    text: "Pesan Grab/Lalamove ke alamat hub pilihanmu.",
  },
  {
    icon: "5️⃣",
    text: "Kirimkan nomor plat/nama driver ke WhatsApp admin.",
  },
  {
    icon: "6️⃣",
    text: "Barang sampai → admin kirim foto bukti serah terima + nomor label barangmu. Selesai! ✅",
  },
];

export function CaraTitipMandiri() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <FadeIn className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Mager Keluar? Kirim Sendiri via <span className="gradient-text">Grab/Lalamove</span> 🚗
          </h2>
          <p className="mt-3 text-foreground/70">
            Tidak wajib tunggu armada kami. Bisa kapan saja termasuk hari libur.
          </p>
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
          <div className="mt-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm text-yellow-200">
            💡 Opsi kirim mandiri buka 24 jam dengan janji temu. Cocok untuk hari Minggu dan
            tanggal merah.
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
