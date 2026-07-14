// Menyamakan format nomor WhatsApp sebelum dibandingkan — pelanggan bisa
// mengetik "08xx", "+628xx", "628xx", atau dengan spasi/strip, sementara
// yang tersimpan di database mengikuti format saat pemesanan pertama kali.
export function normalizeWhatsapp(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  return digits;
}
