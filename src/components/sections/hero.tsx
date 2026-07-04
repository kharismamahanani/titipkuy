"use client";

import Image from "next/image";
import Link from "next/link";
import { Tag, Camera, Truck, ShieldCheck } from "lucide-react";
import { tkButtonVariants } from "@/components/ui/tk-button";

const TRUST_ITEMS = [
  { icon: Tag, label: "Label Bernomor Seri" },
  { icon: Camera, label: "Foto Bukti" },
  { icon: Truck, label: "Antar-Jemput" },
  { icon: ShieldCheck, label: "Perjanjian Digital" },
];

function HeroIllustration() {
  return (
    <Image
      src="/favicon.png"
      alt="TitipKuy! — jasa simpan barang Malang"
      width={512}
      height={512}
      priority
      className="h-[240px] w-[240px] sm:h-[300px] sm:w-[300px]"
    />
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
          <HeroIllustration />
        </div>
      </div>

      <div className="border-y-[1.5px] border-[#D6CEC4] bg-tk-cream-alt px-4 py-6 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-10">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-tk-charcoal bg-tk-cream">
                <Icon size={16} className="text-tk-orange-dark" strokeWidth={2.5} />
              </span>
              <span className="text-xs font-bold text-tk-charcoal">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
