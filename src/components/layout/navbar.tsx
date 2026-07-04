"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tkButtonVariants } from "@/components/ui/tk-button";

const MENU_LINKS = [
  { label: "Paket & Harga", href: "#paket" },
  { label: "Hitung Biaya ⚡", href: "#kalkulator" },
  { label: "Lokasi & Jam", href: "#lokasi" },
  { label: "Cara Kerja", href: "#cara-kerja" },
];

function LogoMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#E89C65" stroke="#3D4A41" strokeWidth="3" />
      <rect x="19" y="42" width="4" height="10" rx="2" fill="#3D4A41" transform="rotate(-12 21 42)" />
      <rect x="38" y="42" width="4" height="10" rx="2" fill="#3D4A41" transform="rotate(14 40 42)" />
      <rect x="15" y="28" width="8" height="16" rx="4" fill="#E89C65" stroke="#3D4A41" strokeWidth="2.5" />
      <rect x="21" y="26" width="16" height="18" rx="7" fill="#7FA99B" stroke="#3D4A41" strokeWidth="2.5" />
      <rect x="18" y="34" width="18" height="11" rx="2" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="2.5" />
      <line x1="27" y1="34" x2="27" y2="45" stroke="#3D4A41" strokeWidth="1.5" />
      <circle cx="30" cy="18" r="8" fill="#FAF6F0" stroke="#3D4A41" strokeWidth="2.5" />
      <path d="M22 17 Q22 9 30 10 Q39 9 39 16 Q34 12 30 13 Q26 12 22 17 Z" fill="#3D4A41" />
      <circle cx="27.5" cy="19" r="1" fill="#3D4A41" />
      <circle cx="33" cy="19" r="1" fill="#3D4A41" />
    </svg>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-[2px] border-tk-charcoal bg-tk-cream">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-[14px]">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-xl font-extrabold"
        >
          <LogoMark />
          <span>
            <span className="text-tk-charcoal">Titip</span>
            <span className="text-tk-orange">Kuy!</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {MENU_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-tk-charcoal underline decoration-tk-orange decoration-2 underline-offset-4 decoration-transparent transition-colors hover:decoration-tk-orange"
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link
          href="/pesan"
          className={cn(tkButtonVariants({ variant: "nav", size: "sm" }), "hidden sm:inline-flex")}
        >
          Pesan sekarang
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-tk-charcoal md:hidden"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      <div
        className={cn(
          "grid overflow-hidden bg-tk-cream transition-[grid-template-rows,opacity] duration-300 ease-in-out md:hidden",
          isOpen
            ? "grid-rows-[1fr] border-t-[2px] border-tk-charcoal opacity-100"
            : "grid-rows-[0fr] border-t-0 opacity-0"
        )}
      >
        <div className="min-h-0 px-8 pb-6">
          <div className="flex flex-col gap-4 pt-4">
            {MENU_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold text-tk-charcoal"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/pesan"
              onClick={() => setIsOpen(false)}
              className={cn(tkButtonVariants({ variant: "nav", size: "sm" }), "w-full")}
            >
              Pesan sekarang
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
