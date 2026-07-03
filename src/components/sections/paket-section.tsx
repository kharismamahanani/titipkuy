"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn, formatRupiah } from "@/lib/utils";
import { getWhatsAppUrl } from "@/constants/site";
import { TkCard } from "@/components/ui/tk-card";
import { tkButtonVariants } from "@/components/ui/tk-button";
import type { Paket } from "@/types/paket";

type FetchState = "loading" | "success" | "error";
type Tab = "harian" | "bulanan";

function isPromo(paket: Paket) {
  return paket.nama.toUpperCase().includes("PROMO");
}

function isTerlaris(paket: Paket) {
  return paket.nama.includes("Magang 3 Bulan (5x Box L)");
}

export function PaketSection() {
  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const [tab, setTab] = useState<Tab>("harian");

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

  const filteredPaket = paketList.filter((p) =>
    tab === "harian"
      ? p.kategori === "harian"
      : p.kategori === "bulanan" || p.kategori === "magang" || p.kategori === "motor"
  );

  return (
    <section id="paket" className="bg-tk-card px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold text-tk-charcoal">Paket &amp; Harga 📦</h2>
          <p className="mt-3 text-tk-muted">Harga transparan, tidak ada biaya tersembunyi.</p>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {(["harian", "bulanan"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg border-2 border-tk-charcoal px-5 py-2 text-sm font-bold transition-colors",
                tab === t ? "bg-tk-charcoal text-tk-cream" : "bg-tk-cream text-tk-charcoal"
              )}
            >
              {t === "harian" ? "🧳 Harian" : "🎓 Bulanan/Magang"}
            </button>
          ))}
        </div>

        {state === "loading" && (
          <p className="mt-12 text-center text-tk-muted">Memuat paket...</p>
        )}

        {state === "error" && (
          <div className="mt-12 text-center">
            <p className="text-tk-muted">
              Paket belum bisa dimuat. Tenang, langsung chat kami aja.
            </p>
            <a
              href={getWhatsAppUrl("Halo TitipKuy! Boleh info paket & harganya?")}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(tkButtonVariants({ variant: "primary", size: "md" }), "mt-4 inline-flex")}
            >
              Tanya via WhatsApp
            </a>
          </div>
        )}

        {state === "success" && filteredPaket.length === 0 && (
          <p className="mt-12 text-center text-tk-muted">
            Belum ada paket tersedia untuk kategori ini.
          </p>
        )}

        {state === "success" && filteredPaket.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPaket.map((paket) => {
              const featured = isTerlaris(paket);
              const promo = isPromo(paket);

              return (
                <TkCard
                  key={paket.id}
                  variant={featured ? "orange" : "default"}
                  className="relative flex flex-col"
                >
                  {(promo || featured) && (
                    <div className="absolute -top-3 right-5 flex gap-1.5">
                      {promo && (
                        <span className="rounded-full border-2 border-tk-charcoal bg-tk-orange px-3 py-1 text-xs font-extrabold text-tk-charcoal">
                          🎉 PROMO
                        </span>
                      )}
                      {featured && (
                        <span className="rounded-full border-2 border-tk-charcoal bg-tk-charcoal px-3 py-1 text-xs font-extrabold text-tk-cream">
                          🔥 Terlaris
                        </span>
                      )}
                    </div>
                  )}

                  <p
                    className={cn(
                      "text-xs font-extrabold uppercase tracking-wide",
                      featured ? "text-tk-charcoal/70" : "text-tk-sage-dark"
                    )}
                  >
                    {paket.durasiHari ? `${paket.durasiHari} hari` : "Harian"}
                  </p>

                  <h3 className="mt-1 text-lg font-extrabold text-tk-charcoal">{paket.nama}</h3>

                  {paket.deskripsi && (
                    <p
                      className={cn(
                        "mt-3 flex-1 text-sm",
                        featured ? "text-tk-charcoal/80" : "text-tk-muted"
                      )}
                    >
                      {paket.deskripsi}
                    </p>
                  )}

                  <p
                    className={cn(
                      "mt-6 text-2xl font-extrabold",
                      featured ? "text-tk-charcoal" : "text-tk-orange"
                    )}
                  >
                    {formatRupiah(paket.harga)}
                  </p>

                  <Link
                    href={`/pesan?paketId=${paket.id}`}
                    className={cn(tkButtonVariants({ variant: "primary", size: "sm" }), "mt-6 justify-center")}
                  >
                    Pilih paket ini
                  </Link>
                </TkCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
