import { cn } from "@/lib/utils";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

// Crop lingkaran kecil dari logo.png (badge lengkap, 1536x1024) — hanya
// menampilkan karakter + pin ikon di tengah, tanpa wordmark "TitipKuy!"
// yang sudah dirender terpisah sebagai teks di sebelahnya. Dipakai sebagai
// CSS background (bukan next/image) supaya crop presisi lewat
// background-size/position, bukan bergantung pada object-fit + transform.
export function LogoMark({ size = 36, className }: LogoMarkProps) {
  return (
    <span
      className={cn(
        "block shrink-0 rounded-full border-2 border-tk-charcoal bg-tk-cream",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundImage: "url(/logo.png)",
        backgroundSize: "248% 165%",
        backgroundPosition: "50% 15%",
        backgroundRepeat: "no-repeat",
      }}
      role="img"
      aria-label="TitipKuy!"
    />
  );
}
