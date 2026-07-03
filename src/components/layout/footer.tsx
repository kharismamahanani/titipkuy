import { MessageCircle } from "lucide-react";
import {
  formatWhatsAppDisplay,
  getWhatsAppUrl,
  INSTAGRAM_URL,
  TIKTOK_URL,
} from "@/constants/site";

export function Footer() {
  return (
    <footer id="kontak" className="border-t border-card-border px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <div>
          <p className="gradient-text font-heading text-xl font-extrabold">
            TitipKuy! 📦
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            Titip barang aman di Malang — untuk mahasiswa, wisatawan, dan
            siapa pun yang butuh storage praktis.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <a
            href={getWhatsAppUrl("Halo TitipKuy! Saya mau tanya-tanya.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Business TitipKuy!"
            className="text-foreground/70 transition-colors hover:text-primary-from"
          >
            <MessageCircle size={22} />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram TitipKuy!"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-primary-from"
          >
            Instagram
          </a>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok TitipKuy!"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-primary-from"
          >
            TikTok
          </a>
        </div>

        <a
          href={getWhatsAppUrl("Halo TitipKuy! Saya mau tanya-tanya.")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-primary-from underline underline-offset-4 transition-colors hover:text-primary-to"
        >
          💬 Chat Admin WhatsApp: {formatWhatsAppDisplay()}
        </a>

        <p className="text-xs text-foreground/50">
          © 2026 TitipKuy! Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
