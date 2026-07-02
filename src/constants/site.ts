// ✅ SUDAH DIISI — Nomor WhatsApp Business (format: 62xxxxxxxxxx, tanpa "+")
export const WHATSAPP_NUMBER = "6282330736696";

// ✅ SUDAH DIISI — Nama admin/kontak yang tampil di footer, halaman
// konfirmasi, dan template pesan WhatsApp
export const ADMIN_NAME = "TitipKuy!";

// ✅ SUDAH DIISI — Instagram & TikTok TitipKuy!
export const INSTAGRAM_URL = "https://instagram.com/titipkuy.malang";
export const TIKTOK_URL = "https://tiktok.com/@titipkuy.malang";

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Format tampilan nomor WA, mis. "6282330736696" -> "+62 823-3073-6696"
export function formatWhatsAppDisplay(number: string = WHATSAPP_NUMBER) {
  const rest = number.startsWith("62") ? number.slice(2) : number;
  const groups = [rest.slice(0, 3), rest.slice(3, 7), rest.slice(7)].filter(Boolean);
  return `+62 ${groups.join("-")}`;
}
