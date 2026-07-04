"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tkButtonVariants } from "@/components/ui/tk-button";
import { LogoMark } from "@/components/shared/logo-mark";

const MENU_LINKS = [
  { label: "Paket & Harga", href: "#paket" },
  { label: "Hitung Biaya ⚡", href: "#kalkulator" },
  { label: "Lokasi & Jam", href: "#lokasi" },
  { label: "Cara Kerja", href: "#cara-kerja" },
];

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
