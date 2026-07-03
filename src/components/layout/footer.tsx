import { MessageCircle } from "lucide-react";
import {
  formatWhatsAppDisplay,
  getWhatsAppUrl,
  INSTAGRAM_URL,
  TIKTOK_URL,
} from "@/constants/site";

export function Footer() {
  return (
    <footer id="kontak" className="border-t-[2px] border-tk-muted bg-tk-charcoal px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <div>
          <p className="text-xl font-extrabold text-tk-orange">TitipKuy! 📦</p>
          <p className="mt-1 text-sm text-[#B8C4BE]">
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
            className="font-bold text-tk-sage transition-colors hover:text-tk-orange"
          >
            <MessageCircle size={22} />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram TitipKuy!"
            className="text-sm font-bold text-tk-sage transition-colors hover:text-tk-orange"
          >
            Instagram
          </a>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok TitipKuy!"
            className="text-sm font-bold text-tk-sage transition-colors hover:text-tk-orange"
          >
            TikTok
          </a>
        </div>

        <a
          href={getWhatsAppUrl("Halo TitipKuy! Saya mau tanya-tanya.")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-tk-light underline underline-offset-4 transition-colors hover:text-tk-orange"
        >
          💬 Chat Admin WhatsApp: {formatWhatsAppDisplay()}
        </a>

        <p className="text-xs text-tk-light">
          © 2026 TitipKuy! Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
