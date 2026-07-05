import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { TkCard } from "@/components/ui/tk-card";
import { formatRupiah } from "@/lib/utils";

interface LabaBersihCardProps {
  bulan: string; // format YYYY-MM
  omzet: number;
  pengeluaran: number;
}

export function LabaBersihCard({ bulan, omzet, pengeluaran }: LabaBersihCardProps) {
  const labaBersih = omzet - pengeluaran;
  const margin = omzet > 0 ? (labaBersih / omzet) * 100 : 0;
  const namaBulan = format(new Date(`${bulan}-01`), "MMMM yyyy", { locale: localeId });

  return (
    <TkCard className="space-y-3">
      <h2 className="font-extrabold text-tk-charcoal">💰 Ringkasan Bulan {namaBulan}</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-tk-muted">Omzet (dari transaksi)</span>
          <span className="font-bold text-tk-charcoal">{formatRupiah(omzet)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-tk-muted">Pengeluaran operasional</span>
          <span className="font-bold text-[#C0392B]">-{formatRupiah(pengeluaran)}</span>
        </div>
        <div className="flex justify-between border-t-2 border-tk-charcoal pt-2">
          <span className="font-extrabold text-tk-charcoal">LABA BERSIH</span>
          <span
            className={
              labaBersih < 0
                ? "font-extrabold text-[#C0392B]"
                : "font-extrabold text-tk-orange"
            }
          >
            {formatRupiah(labaBersih)}
          </span>
        </div>
      </div>

      <p className="text-xs text-tk-muted">
        Margin: <span className="font-bold text-tk-charcoal">{margin.toFixed(1)}%</span>
      </p>
    </TkCard>
  );
}
