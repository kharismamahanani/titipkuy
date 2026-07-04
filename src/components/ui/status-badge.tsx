import { cn } from "@/lib/utils";

export type StatusBadgeKind =
  | "AKTIF"
  | "SELESAI"
  | "DIBATALKAN"
  | "BELUM_BAYAR"
  | "LUNAS";

const STATUS_STYLES: Record<StatusBadgeKind, string> = {
  AKTIF: "border-tk-charcoal bg-tk-sage text-tk-cream",
  SELESAI: "border-tk-charcoal bg-tk-charcoal text-tk-cream",
  DIBATALKAN: "border-[#C0392B] bg-tk-cream text-[#C0392B]",
  BELUM_BAYAR: "border-tk-charcoal bg-tk-orange text-tk-charcoal",
  LUNAS: "border-tk-charcoal bg-tk-sage text-tk-cream",
};

interface StatusBadgeProps {
  status: StatusBadgeKind;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[20px] border-2 px-3 py-1 text-xs font-extrabold",
        STATUS_STYLES[status],
        className
      )}
    >
      {children}
    </span>
  );
}
