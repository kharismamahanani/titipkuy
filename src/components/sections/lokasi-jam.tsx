"use client";

import { MessageCircle } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";
import { HUB_CONFIG, JAM_DROP_OFF_MANDIRI, JAM_OPERASIONAL_HUB_SUHAT } from "@/lib/constants";
import {
  INSTAGRAM_URL,
  TIKTOK_URL,
  formatWhatsAppDisplay,
  getWhatsAppUrl,
} from "@/constants/site";

const MAPS_URL = "https://maps.google.com/?q=Jl+Bunga+Lely+Lowokwaru+Malang";

export function LokasiJam() {
  return (
    <section id="lokasi" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <FadeIn className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Lokasi &amp; Jam <span className="gradient-text">Operasional</span> 📍
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass-card gradient-border mt-10 space-y-5 rounded-2xl p-6 text-center sm:p-8">
            <p className="font-heading font-bold">
              📍 {HUB_CONFIG.suhat.nama} — {HUB_CONFIG.suhat.alamat}, Malang
            </p>

            <div className="space-y-1 border-y border-card-border py-4 text-sm text-foreground/80">
              <p>⏰ {JAM_OPERASIONAL_HUB_SUHAT.hari}</p>
              <p>🚫 {JAM_OPERASIONAL_HUB_SUHAT.libur}</p>
              <p>Drop-off mandiri: {JAM_DROP_OFF_MANDIRI}</p>
            </div>

            <div className="space-y-2 text-sm">
              <a
                href={getWhatsAppUrl("Halo TitipKuy! Saya mau tanya-tanya.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-foreground/80 transition-colors hover:text-primary-from"
              >
                <MessageCircle size={16} />
                WhatsApp: {formatWhatsAppDisplay()}
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground/80 transition-colors hover:text-primary-from"
              >
                📸 Instagram: @titipkuy.malang
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground/80 transition-colors hover:text-primary-from"
              >
                🎵 TikTok: @titipkuy.malang
              </a>
            </div>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-semibold text-primary-from underline underline-offset-4 hover:text-primary-to"
            >
              Lihat di Google Maps →
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
