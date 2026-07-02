// TODO: ganti dengan nomor WhatsApp Business asli TitipKuy! (format: 62xxxxxxxxxx, tanpa "+")
export const WHATSAPP_NUMBER = "6281234567890";

// TODO: ganti dengan link Instagram & TikTok asli TitipKuy! saat sudah tersedia
export const INSTAGRAM_URL = "#";
export const TIKTOK_URL = "#";

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
