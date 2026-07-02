"use client";

import { FadeIn } from "@/components/shared/fade-in";
import { getWhatsAppUrl } from "@/constants/site";

const TRUST_BADGES = ["⚡ Bisa Jemput", "📸 Foto Bukti", "✅ Surat Perjanjian Digital"];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-24 text-center sm:px-6">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="gradient-text font-heading text-4xl font-extrabold leading-tight sm:text-6xl">
            Titip Barang,
            <br />
            Tenang Magang! 🔥
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-base text-foreground/70 sm:text-lg">
            Bisa jemput ke kos, foto bukti masuk-keluar, bayar lunas aman.
            Khusus mahasiswa Malang.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <a
            href={getWhatsAppUrl("Halo TitipKuy! Saya mau pesan penitipan barang.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-primary-from to-primary-to px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105"
          >
            Pesan Sekarang via WhatsApp
          </a>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-card-border bg-card-dark/60 px-4 py-2 text-sm text-foreground/80"
              >
                {badge}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
