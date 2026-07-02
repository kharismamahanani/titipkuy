import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  danger?: boolean;
}

export function StatCard({ label, value, danger }: StatCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-5",
        danger && "border border-destructive/50"
      )}
    >
      <p className="text-sm text-foreground/60">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-extrabold",
          danger ? "text-destructive" : "gradient-text"
        )}
      >
        {value}
      </p>
    </div>
  );
}
