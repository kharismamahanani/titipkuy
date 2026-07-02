"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { getWhatsAppUrl } from "@/constants/site";

const MENU_LINKS = [
  { label: "Paket", href: "#paket" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Kontak", href: "#kontak" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-bg-dark/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="gradient-text font-heading text-xl font-extrabold">
          TitipKuy! 📦
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {MENU_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href={getWhatsAppUrl("Halo TitipKuy! Saya mau pesan penitipan barang.")}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full bg-gradient-to-r from-primary-from to-primary-to px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 sm:inline-block"
        >
          Pesan Sekarang
        </a>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-foreground md:hidden"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-card-border bg-bg-dark px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {MENU_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href={getWhatsAppUrl("Halo TitipKuy! Saya mau pesan penitipan barang.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-gradient-to-r from-primary-from to-primary-to px-5 py-2 text-center text-sm font-semibold text-white"
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
