"use client";

import Link from "next/link";
import { tkButtonVariants } from "@/components/ui/tk-button";

const TRUST_ITEMS = [
  "Label Bernomor Seri",
  "Foto Bukti",
  "Antar-Jemput",
  "Perjanjian Digital",
];

function BoxIllustration() {
  return (
    <svg
      viewBox="0 0 280 280"
      className="h-[200px] w-[200px] sm:h-[280px] sm:w-[280px]"
      aria-hidden="true"
    >
      <path
        d="M40 90 L100 40 L180 40 L240 90 Z"
        fill="#7FA99B"
        stroke="#3D4A41"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <rect
        x="40"
        y="90"
        width="200"
        height="150"
        rx="10"
        fill="#E89C65"
        stroke="#3D4A41"
        strokeWidth="6"
      />
      <line x1="140" y1="90" x2="140" y2="240" stroke="#3D4A41" strokeWidth="4" />
      <rect
        x="68"
        y="148"
        width="144"
        height="62"
        rx="8"
        fill="#FFFFFF"
        stroke="#3D4A41"
        strokeWidth="5"
      />
      <line
        x1="82"
        y1="168"
        x2="198"
        y2="168"
        stroke="#3D4A41"
        strokeWidth="4"
        strokeDasharray="6 6"
      />
      <text
        x="140"
        y="196"
        textAnchor="middle"
        fontFamily="Nunito, sans-serif"
        fontWeight="800"
        fontSize="20"
        fill="#3D4A41"
      >
        No. 0089
      </text>
      <circle cx="212" cy="68" r="15" fill="#3D4A41" />
      <circle cx="212" cy="68" r="5" fill="#FAF6F0" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="bg-tk-cream">
      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 px-4 pt-14 pb-16 sm:px-6 lg:flex-row lg:items-center lg:gap-8 lg:pt-20 lg:pb-20">
        <div className="flex w-full flex-col items-start gap-6 text-left lg:w-[60%]">
          <span className="inline-flex w-fit items-center gap-1 rounded-[20px] border-[1.5px] border-tk-charcoal bg-tk-sage px-4 py-1.5 text-sm font-bold text-tk-cream">
            📍 Layanan storage Malang
          </span>

          <h1 className="text-[28px] font-extrabold leading-tight text-tk-charcoal sm:text-[36px]">
            Titip Barang Kos &amp; Koper
            <br />
            di Malang, <span className="text-tk-orange">Gak Pake Pusing!</span>
          </h1>

          <p className="max-w-xl text-base leading-[1.6] text-tk-muted">
            Penyimpanan harian dan bulanan untuk mahasiswa dan wisatawan. Aman,
            terdokumentasi, bisa antar-jemput.
          </p>

          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Link href="/pesan" className={tkButtonVariants({ variant: "primary", size: "md" })}>
              📦 Titip sekarang
            </Link>
            <a
              href="#kalkulator"
              className={tkButtonVariants({ variant: "secondary", size: "md" })}
            >
              ⚡ Hitung biaya dulu
            </a>
          </div>
        </div>

        <div className="flex w-full justify-center lg:w-[40%]">
          <BoxIllustration />
        </div>
      </div>

      <div className="border-y-[1.5px] border-[#D6CEC4] bg-tk-cream-alt px-4 py-6 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-8">
          {TRUST_ITEMS.map((item) => (
            <div key={item} className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-tk-orange" />
              <span className="text-xs font-bold text-tk-charcoal">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
