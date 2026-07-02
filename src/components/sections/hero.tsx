"use client";

import { FadeIn } from "@/components/shared/fade-in";
import type { KalkulatorMode } from "@/types/kalkulator";

const TRUST_BADGES = ["🛡️ Segel Cable Tie", "📸 Foto Bukti", "🛵 Jemput ke Pintu"];

interface HeroProps {
  onSelectMode: (mode: KalkulatorMode) => void;
}

export function Hero({ onSelectMode }: HeroProps) {
  function handleClick(mode: KalkulatorMode) {
    onSelectMode(mode);
    document.getElementById("kalkulator")?.scrollIntoView({ behavior: "smooth" });
  }

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
            <button
              type="button"
              onClick={() => handleClick("harian")}
              className="w-full rounded-full bg-gradient-to-r from-primary-from to-primary-to px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 sm:w-auto"
            >
              🧳 Titip Harian / Wisata
            </button>
            <button
              type="button"
              onClick={() => handleClick("bulanan")}
              className="gradient-border w-full rounded-full bg-bg-dark px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-105 sm:w-auto"
            >
              🎓 Titip Bulanan / Kos
            </button>
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
