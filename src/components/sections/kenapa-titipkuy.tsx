"use client";

import { Tag, Camera, Bike, FileText, Box } from "lucide-react";
import { TkCard } from "@/components/ui/tk-card";
import { cn } from "@/lib/utils";
import type { TkCardProps } from "@/components/ui/tk-card";

const ALASAN: {
  icon: typeof Tag;
  title: string;
  desc: string;
  variant: NonNullable<TkCardProps["variant"]>;
}[] = [
  {
    icon: Box,
    title: "📦 Kemasan Wajib, Kondisi Terjamin",
    desc: "Semua barang wajib dalam kardus atau bubble wrap. Kondisi masuk = kondisi keluar. Jika beda, kami tanggung.",
    variant: "orange",
  },
  {
    icon: Tag,
    title: "🏷️ Label Bernomor Seri",
    desc: "Setiap barang dapat label unik bernomor seri. Scan QR di label untuk cek status barangmu kapan saja.",
    variant: "default",
  },
  {
    icon: Camera,
    title: "📸 Foto Bukti Masuk & Keluar",
    desc: "Tim kami memotret kondisi barang saat diterima dan saat dikembalikan. Foto dikirim ke WhatsApp kamu sebagai bukti.",
    variant: "sage",
  },
  {
    icon: Bike,
    title: "🛵 Antar-Jemput ke Pintumu",
    desc: "Males ke hub? Armada kami yang ke kos/hotel kamu. Motor untuk area sekitar, mobil untuk barang banyak.",
    variant: "default",
  },
  {
    icon: FileText,
    title: "📄 Surat Pernyataan Kesediaan Digital",
    desc: "Semua transaksi dilindungi surat pernyataan kesediaan digital yang tersimpan rapi dan bisa diunduh kapan saja.",
    variant: "default",
  },
];

export function KenapaTitipkuy() {
  return (
    <section className="bg-tk-card px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-[28px] font-extrabold text-tk-charcoal">
          Kenapa pilih TitipKuy!? 🤔
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {ALASAN.map((item) => {
            const Icon = item.icon;
            const isColored = item.variant === "orange" || item.variant === "sage";
            return (
              <TkCard key={item.title} variant={item.variant} className="flex h-full gap-4">
                <Icon
                  className={cn("mt-1 shrink-0", isColored ? "text-tk-charcoal" : "text-tk-orange")}
                  size={28}
                />
                <div>
                  <h3
                    className={cn(
                      "font-extrabold",
                      item.variant === "sage" ? "text-tk-cream" : "text-tk-charcoal"
                    )}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 text-sm",
                      item.variant === "sage"
                        ? "text-tk-cream/90"
                        : item.variant === "orange"
                          ? "text-tk-charcoal/80"
                          : "text-tk-muted"
                    )}
                  >
                    {item.desc}
                  </p>
                </div>
              </TkCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
