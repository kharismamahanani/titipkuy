"use client";

import Link from "next/link";
import { FadeIn } from "@/components/shared/fade-in";

const TRUST_BADGES = ["🏷️ Label Bernomor Seri", "📸 Foto Bukti", "🛵 Jemput ke Pintu"];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-24 text-center sm:px-6">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="gradient-text font-heading text-4xl font-extrabold leading-tight sm:text-6xl">
            Simpan Barangmu di Malang,
            <br />
            Bebas Ribet! 📦
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-base text-foreground/70 sm:text-lg">
            Penitipan koper harian untuk wisatawan &amp; storage bulanan untuk
            mahasiswa. Aman, terdokumentasi, jemput ke pintumu.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/pesan?mode=harian"
              className="inline-block w-full rounded-full bg-gradient-to-r from-primary-from to-primary-to px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 sm:w-auto"
            >
              🧳 Titip Harian / Wisata
            </Link>
            <Link
              href="/pesan?mode=bulanan"
              className="gradient-border inline-block w-full rounded-full bg-bg-dark px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-105 sm:w-auto"
            >
              🎓 Titip Bulanan / Kos
            </Link>
          </div>
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
