import { cn } from "@/lib/utils";

type StatAccent = "orange" | "sage" | "charcoal";

const ACCENT_BORDER: Record<StatAccent, string> = {
  orange: "border-t-tk-orange",
  sage: "border-t-tk-sage",
  charcoal: "border-t-tk-charcoal",
};

interface StatCardProps {
  label: string;
  value: string;
  danger?: boolean;
  accent?: StatAccent;
}

export function StatCard({ label, value, danger, accent = "charcoal" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]",
        "border-t-4",
        danger ? "border-t-[#C0392B]" : ACCENT_BORDER[accent]
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-tk-muted">{label}</p>
      <p
        className={cn(
          "mt-2 text-[28px] font-extrabold",
          danger ? "text-[#C0392B]" : "text-tk-charcoal"
        )}
      >
        {value}
      </p>
    </div>
  );
}
