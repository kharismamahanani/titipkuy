"use client";

import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { TkCard } from "@/components/ui/tk-card";
import { tkButtonVariants } from "@/components/ui/tk-button";
import { HUB_CONFIG, JAM_DROP_OFF_MANDIRI, JAM_OPERASIONAL_HUB_SUHAT } from "@/lib/constants";
import {
  INSTAGRAM_URL,
  TIKTOK_URL,
  formatWhatsAppDisplay,
  getWhatsAppUrl,
} from "@/constants/site";

const MAPS_URL = "https://maps.app.goo.gl/qtmjRK84Hh1FfQsE6";

export function LokasiJam() {
  return (
    <section id="lokasi" className="bg-tk-cream-alt px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-[28px] font-extrabold text-tk-charcoal">
          Lokasi &amp; Jam Operasional 📍
        </h2>

        <TkCard className="mx-auto mt-10 max-w-[560px] space-y-5 text-center sm:p-8">
          <p className="font-extrabold text-tk-charcoal">
            📍 {HUB_CONFIG.suhat.nama} — {HUB_CONFIG.suhat.alamat}, Malang
          </p>

          <div className="space-y-1 border-y-[1.5px] border-[#D6CEC4] py-4 text-sm text-tk-muted">
            <p>⏰ {JAM_OPERASIONAL_HUB_SUHAT.hari}</p>
            <p>🚫 {JAM_OPERASIONAL_HUB_SUHAT.libur}</p>
            <p>Drop-off mandiri: {JAM_DROP_OFF_MANDIRI}</p>
          </div>

          <div className="space-y-2 border-b-[1.5px] border-[#D6CEC4] pb-5 text-sm">
            <a
              href={getWhatsAppUrl("Halo TitipKuy! Saya mau tanya-tanya.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-bold text-tk-charcoal transition-colors hover:text-tk-orange"
            >
              <FaWhatsapp size={20} color="#3D4A41" />
              {formatWhatsAppDisplay()}
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-bold text-tk-charcoal transition-colors hover:text-tk-orange"
            >
              <FaInstagram size={20} color="#3D4A41" />
              @titipkuy.malang
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-bold text-tk-charcoal transition-colors hover:text-tk-orange"
            >
              <FaTiktok size={20} color="#3D4A41" />
              @titipkuy.malang
            </a>
          </div>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={tkButtonVariants({ variant: "secondary", size: "sm" })}
          >
            Lihat di Google Maps →
          </a>
        </TkCard>
      </div>
    </section>
  );
}
