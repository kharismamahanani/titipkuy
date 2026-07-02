"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/shared/fade-in";
import { formatRupiah } from "@/lib/utils";
import { getWhatsAppUrl } from "@/constants/site";
import type { Paket } from "@/types/paket";

type FetchState = "loading" | "success" | "error";

function isTerlaris(paket: Paket) {
  return paket.nama.toLowerCase().includes("magang 3 bulan");
}

export function PaketSection() {
  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [state, setState] = useState<FetchState>("loading");

  useEffect(() => {
    let isMounted = true;

    fetch("/api/paket")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data paket");
        return res.json();
      })
      .then((data: Paket[]) => {
        if (isMounted) {
          setPaketList(data);
          setState("success");
        }
      })
      .catch(() => {
        if (isMounted) setState("error");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="paket" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Pilih <span className="gradient-text">Paket</span> Kamu
          </h2>
          <p className="mt-3 text-foreground/70">
            Harga jelas, langsung lunas, tanpa biaya tersembunyi.
          </p>
        </FadeIn>

        {state === "loading" && (
          <p className="mt-12 text-center text-foreground/60">Memuat paket...</p>
        )}

        {state === "error" && (
          <div className="mt-12 text-center">
            <p className="text-foreground/60">
              Paket belum bisa dimuat. Tenang, langsung chat kami aja.
            </p>
            <a
              href={getWhatsAppUrl("Halo TitipKuy! Boleh info paket & harganya?")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-primary-from to-primary-to px-6 py-3 text-sm font-semibold text-white"
            >
              Tanya via WhatsApp
            </a>
          </div>
        )}

        {state === "success" && paketList.length === 0 && (
          <p className="mt-12 text-center text-foreground/60">
            Belum ada paket tersedia saat ini.
          </p>
        )}

        {state === "success" && paketList.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paketList.map((paket, index) => (
              <motion.div
                key={paket.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                className="glass-card gradient-border relative flex flex-col rounded-2xl p-6"
              >
                {isTerlaris(paket) && (
                  <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-primary-from to-primary-to px-3 py-1 text-xs font-semibold text-white">
                    Terlaris 🔥
                  </span>
                )}

                <h3 className="font-heading text-lg font-bold">{paket.nama}</h3>
                <p className="mt-1 text-sm text-foreground/60">
                  {paket.durasiHari ? `${paket.durasiHari} hari` : "Harian"}
                </p>

                {paket.deskripsi && (
                  <p className="mt-3 flex-1 text-sm text-foreground/70">
                    {paket.deskripsi}
                  </p>
                )}

                <p className="gradient-text mt-6 text-2xl font-extrabold">
                  {formatRupiah(paket.harga)}
                </p>

                <Link
                  href={`/pesan?paket=${paket.id}`}
                  className="mt-6 block rounded-full border border-primary-from/60 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
                >
                  Pilih Paket
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
