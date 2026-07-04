"use client";

import Link from "next/link";
import { Tag, Camera, Truck, ShieldCheck } from "lucide-react";
import { tkButtonVariants } from "@/components/ui/tk-button";

const TRUST_ITEMS = [
  { icon: Tag, label: "Label Bernomor Seri" },
  { icon: Camera, label: "Foto Bukti" },
  { icon: Truck, label: "Antar-Jemput" },
  { icon: ShieldCheck, label: "Perjanjian Digital" },
];

// Ikon mini reusable untuk badge yang mengelilingi lencana di ilustrasi hero.
function MiniBackpackIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-8" y="-6" width="16" height="18" rx="5" fill="#E89C65" stroke="#3D4A41" strokeWidth="2" />
      <path d="M-4 -6 Q-4 -12 4 -12 Q4 -6 4 -6" fill="none" stroke="#3D4A41" strokeWidth="2" />
      <rect x="-5" y="1" width="10" height="4" rx="1.5" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="1.5" />
    </g>
  );
}

function MiniBoxIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-9" y="-8" width="18" height="16" rx="2" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="2" />
      <line x1="0" y1="-8" x2="0" y2="8" stroke="#3D4A41" strokeWidth="1.5" />
      <line x1="-9" y1="0" x2="9" y2="0" stroke="#3D4A41" strokeWidth="1.5" strokeDasharray="2.5 2" />
    </g>
  );
}

function MiniSuitcaseIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-9" y="-6" width="18" height="14" rx="3" fill="#7FA99B" stroke="#3D4A41" strokeWidth="2" />
      <path d="M-4 -6 L-4 -9 Q-4 -11 -2 -11 L2 -11 Q4 -11 4 -9 L4 -6" fill="none" stroke="#3D4A41" strokeWidth="2" />
      <line x1="-9" y1="1" x2="9" y2="1" stroke="#3D4A41" strokeWidth="1.5" />
    </g>
  );
}

function MiniLockIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-8" y="-2" width="16" height="13" rx="3" fill="#E89C65" stroke="#3D4A41" strokeWidth="2" />
      <path d="M-4 -2 L-4 -6 Q-4 -12 0 -12 Q4 -12 4 -6 L4 -2" fill="none" stroke="#3D4A41" strokeWidth="2" />
      <circle cx="0" cy="4" r="1.6" fill="#3D4A41" />
    </g>
  );
}

function IconBadge({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r="17" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="2.5" />
      {children}
    </g>
  );
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 340 320"
      className="h-[240px] w-[255px] sm:h-[300px] sm:w-[320px]"
      aria-hidden="true"
    >
      {/* awan */}
      <g fill="#FFFFFF" stroke="#3D4A41" strokeWidth="2" opacity="0.9">
        <ellipse cx="42" cy="40" rx="20" ry="11" />
        <ellipse cx="58" cy="34" rx="14" ry="9" />
      </g>
      <g fill="#FFFFFF" stroke="#3D4A41" strokeWidth="2" opacity="0.9">
        <ellipse cx="300" cy="30" rx="18" ry="10" />
        <ellipse cx="284" cy="26" rx="12" ry="8" />
      </g>

      {/* dekorasi mengambang */}
      <circle cx="308" cy="70" r="4" fill="#E89C65" />
      <circle cx="24" cy="90" r="3" fill="#7FA99B" />
      <path d="M296 100 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#E89C65" />
      <path d="M30 130 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5 Z" fill="#7FA99B" />

      {/* bukit belakang */}
      <path
        d="M0 268 Q60 230 130 262 Q190 232 260 264 Q300 244 340 262 L340 290 L0 290 Z"
        fill="#7FA99B"
        opacity="0.35"
      />

      {/* lencana besar di belakang karakter */}
      <circle cx="178" cy="150" r="96" fill="#E89C65" stroke="#3D4A41" strokeWidth="5" />
      <circle cx="178" cy="150" r="80" fill="none" stroke="#3D4A41" strokeWidth="2.5" opacity="0.6" />

      {/* ikon mengelilingi lencana */}
      <IconBadge x={112} y={66}>
        <MiniBackpackIcon x={112} y={66} />
      </IconBadge>
      <IconBadge x={178} y={46}>
        <MiniBoxIcon x={178} y={46} />
      </IconBadge>
      <IconBadge x={244} y={66}>
        <MiniSuitcaseIcon x={244} y={66} />
      </IconBadge>
      <IconBadge x={266} y={128}>
        <MiniLockIcon x={266} y={128} />
      </IconBadge>

      {/* garis tanah */}
      <line x1="10" y1="290" x2="330" y2="290" stroke="#3D4A41" strokeWidth="4" strokeLinecap="round" />

      {/* Tugu Malang */}
      <path d="M40 290 L80 290 L71 273 L49 273 Z" fill="#7FA99B" stroke="#3D4A41" strokeWidth="4" strokeLinejoin="round" />
      <rect x="49" y="244" width="22" height="29" rx="2" fill="#7FA99B" stroke="#3D4A41" strokeWidth="4" />
      <rect x="56" y="163" width="8" height="81" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="4" />
      <rect x="50" y="146" width="20" height="18" rx="3" fill="#E89C65" stroke="#3D4A41" strokeWidth="4" />
      <circle cx="60" cy="134" r="7" fill="#E89C65" stroke="#3D4A41" strokeWidth="4" />

      {/* gedung kota */}
      <rect x="248" y="186" width="42" height="104" rx="4" fill="#FFFFFF" stroke="#3D4A41" strokeWidth="5" />
      <rect x="257" y="197" width="9" height="9" fill="#7FA99B" />
      <rect x="272" y="197" width="9" height="9" fill="#7FA99B" />
      <rect x="257" y="213" width="9" height="9" fill="#7FA99B" />
      <rect x="272" y="213" width="9" height="9" fill="#7FA99B" />
      <rect x="257" y="229" width="9" height="9" fill="#7FA99B" />
      <rect x="272" y="229" width="9" height="9" fill="#7FA99B" />
      <rect x="252" y="272" width="34" height="15" rx="2" fill="#E89C65" stroke="#3D4A41" strokeWidth="3" />
      <text
        x="269"
        y="283"
        textAnchor="middle"
        fontFamily="Nunito, sans-serif"
        fontWeight="800"
        fontSize="8"
        fill="#3D4A41"
      >
        KOST
      </text>

      {/* menara pilin */}
      <g>
        <rect x="292" y="142" width="34" height="148" rx="4" fill="#7FA99B" stroke="#3D4A41" strokeWidth="5" />
        <path
          d="M292 158 L326 168 M292 178 L326 188 M292 198 L326 208 M292 218 L326 228 M292 238 L326 248 M292 258 L326 268"
          stroke="#3D4A41"
          strokeWidth="1.5"
          opacity="0.5"
        />
      </g>

      {/* karakter berjalan */}
      <rect x="150" y="242" width="16" height="48" rx="8" fill="#3D4A41" transform="rotate(-14 158 242)" />
      <rect x="194" y="242" width="16" height="48" rx="8" fill="#3D4A41" transform="rotate(16 202 242)" />
      <ellipse cx="150" cy="291" rx="14" ry="7" fill="#E89C65" stroke="#3D4A41" strokeWidth="3" />
      <ellipse cx="214" cy="291" rx="14" ry="7" fill="#E89C65" stroke="#3D4A41" strokeWidth="3" />

      {/* ransel mengintip */}
      <rect x="140" y="191" width="25" height="58" rx="10" fill="#E89C65" stroke="#3D4A41" strokeWidth="5" />

      {/* badan */}
      <rect x="154" y="186" width="56" height="62" rx="22" fill="#7FA99B" stroke="#3D4A41" strokeWidth="5" />
      <path d="M167 189 Q163 209 169 228" fill="none" stroke="#3D4A41" strokeWidth="3" strokeLinecap="round" />

      {/* lengan memeluk kardus */}
      <path d="M164 206 Q138 221 147 243 L161 243 Q157 222 177 214 Z" fill="#7FA99B" stroke="#3D4A41" strokeWidth="4" strokeLinejoin="round" />
      <path d="M200 206 Q226 221 217 243 L203 243 Q207 222 187 214 Z" fill="#7FA99B" stroke="#3D4A41" strokeWidth="4" strokeLinejoin="round" />

      {/* kardus */}
      <rect x="149" y="227" width="62" height="38" rx="6" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="5" />
      <line x1="180" y1="227" x2="180" y2="265" stroke="#3D4A41" strokeWidth="3" />
      <line x1="149" y1="244" x2="211" y2="244" stroke="#3D4A41" strokeWidth="3" strokeDasharray="5 4" />

      {/* kepala */}
      <circle cx="182" cy="169" r="24" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="5" />
      <path
        d="M157 166 Q158 137 182 140 Q207 137 208 164 Q197 148 182 151 Q167 148 157 166 Z"
        fill="#3D4A41"
      />
      <circle cx="174" cy="171" r="2.5" fill="#3D4A41" />
      <circle cx="191" cy="171" r="2.5" fill="#3D4A41" />
      <path d="M174 179 Q182 186 190 179" fill="none" stroke="#3D4A41" strokeWidth="3" strokeLinecap="round" />
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
