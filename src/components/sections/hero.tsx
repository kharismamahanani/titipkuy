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
      viewBox="0 0 300 300"
      className="h-[220px] w-[220px] sm:h-[300px] sm:w-[300px]"
      aria-hidden="true"
    >
      {/* dekorasi mengambang */}
      <circle cx="256" cy="52" r="4" fill="#E89C65" />
      <circle cx="44" cy="60" r="3" fill="#7FA99B" />
      <path
        d="M222 82 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z"
        fill="#E89C65"
      />

      {/* garis tanah */}
      <line x1="16" y1="253" x2="284" y2="253" stroke="#3D4A41" strokeWidth="4" strokeLinecap="round" />

      {/* Tugu Malang */}
      <path d="M35 253 L75 253 L66 236 L44 236 Z" fill="#7FA99B" stroke="#3D4A41" strokeWidth="4" strokeLinejoin="round" />
      <rect x="44" y="207" width="22" height="29" rx="2" fill="#7FA99B" stroke="#3D4A41" strokeWidth="4" />
      <rect x="51" y="126" width="8" height="81" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="4" />
      <rect x="45" y="109" width="20" height="18" rx="3" fill="#E89C65" stroke="#3D4A41" strokeWidth="4" />
      <circle cx="55" cy="97" r="7" fill="#E89C65" stroke="#3D4A41" strokeWidth="4" />

      {/* gedung kota */}
      <rect x="207" y="149" width="42" height="104" rx="4" fill="#FFFFFF" stroke="#3D4A41" strokeWidth="5" />
      <rect x="216" y="160" width="9" height="9" fill="#7FA99B" />
      <rect x="231" y="160" width="9" height="9" fill="#7FA99B" />
      <rect x="216" y="176" width="9" height="9" fill="#7FA99B" />
      <rect x="231" y="176" width="9" height="9" fill="#7FA99B" />
      <rect x="216" y="192" width="9" height="9" fill="#7FA99B" />
      <rect x="231" y="192" width="9" height="9" fill="#7FA99B" />
      <rect x="211" y="235" width="34" height="15" rx="2" fill="#E89C65" stroke="#3D4A41" strokeWidth="3" />
      <text
        x="228"
        y="246"
        textAnchor="middle"
        fontFamily="Nunito, sans-serif"
        fontWeight="800"
        fontSize="8"
        fill="#3D4A41"
      >
        KOST
      </text>

      <rect x="251" y="105" width="34" height="148" rx="4" fill="#7FA99B" stroke="#3D4A41" strokeWidth="5" />
      <rect x="259" y="118" width="8" height="8" fill="#FAF6F0" />
      <rect x="273" y="118" width="8" height="8" fill="#FAF6F0" />
      <rect x="259" y="134" width="8" height="8" fill="#FAF6F0" />
      <rect x="273" y="134" width="8" height="8" fill="#FAF6F0" />
      <rect x="259" y="150" width="8" height="8" fill="#FAF6F0" />
      <rect x="273" y="150" width="8" height="8" fill="#FAF6F0" />

      {/* karakter berjalan */}
      <rect x="120" y="205" width="16" height="48" rx="8" fill="#3D4A41" transform="rotate(-14 128 205)" />
      <rect x="164" y="205" width="16" height="48" rx="8" fill="#3D4A41" transform="rotate(16 172 205)" />
      <ellipse cx="120" cy="254" rx="14" ry="7" fill="#E89C65" stroke="#3D4A41" strokeWidth="3" />
      <ellipse cx="184" cy="254" rx="14" ry="7" fill="#E89C65" stroke="#3D4A41" strokeWidth="3" />

      {/* ransel mengintip */}
      <rect x="110" y="154" width="25" height="58" rx="10" fill="#E89C65" stroke="#3D4A41" strokeWidth="5" />

      {/* badan */}
      <rect x="124" y="149" width="56" height="62" rx="22" fill="#7FA99B" stroke="#3D4A41" strokeWidth="5" />
      <path d="M137 152 Q133 172 139 191" fill="none" stroke="#3D4A41" strokeWidth="3" strokeLinecap="round" />

      {/* lengan memeluk kardus */}
      <path d="M134 169 Q108 184 117 206 L131 206 Q127 185 147 177 Z" fill="#7FA99B" stroke="#3D4A41" strokeWidth="4" strokeLinejoin="round" />
      <path d="M170 169 Q196 184 187 206 L173 206 Q177 185 157 177 Z" fill="#7FA99B" stroke="#3D4A41" strokeWidth="4" strokeLinejoin="round" />

      {/* kardus */}
      <rect x="119" y="190" width="62" height="38" rx="6" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="5" />
      <line x1="150" y1="190" x2="150" y2="228" stroke="#3D4A41" strokeWidth="3" />
      <line x1="119" y1="207" x2="181" y2="207" stroke="#3D4A41" strokeWidth="3" strokeDasharray="5 4" />

      {/* kepala */}
      <circle cx="152" cy="132" r="24" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="5" />
      <path
        d="M127 129 Q128 100 152 103 Q177 100 178 127 Q167 111 152 114 Q137 111 127 129 Z"
        fill="#3D4A41"
      />
      <circle cx="144" cy="134" r="2.5" fill="#3D4A41" />
      <circle cx="161" cy="134" r="2.5" fill="#3D4A41" />
      <path d="M144 142 Q152 149 160 142" fill="none" stroke="#3D4A41" strokeWidth="3" strokeLinecap="round" />
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
