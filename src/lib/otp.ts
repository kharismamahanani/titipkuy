export const OTP_VALID_MS = 5 * 60 * 1000; // 5 menit

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
