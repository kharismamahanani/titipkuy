"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah } from "@/lib/utils";
import type { TrenBulan, TrenBulanPengeluaran } from "@/types/rekap";

interface OmzetVsPengeluaranChartProps {
  omzet: TrenBulan[];
  pengeluaran: TrenBulanPengeluaran[];
}

export function OmzetVsPengeluaranChart({ omzet, pengeluaran }: OmzetVsPengeluaranChartProps) {
  const data = omzet.map((item) => ({
    bulan: format(new Date(`${item.bulan}-01`), "MMM", { locale: localeId }),
    omzet: item.omzet,
    pengeluaran: pengeluaran.find((p) => p.bulan === item.bulan)?.pengeluaran ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D6CEC4" vertical={false} />
        <XAxis dataKey="bulan" stroke="#3D4A41" fontSize={12} />
        <YAxis
          stroke="#3D4A41"
          fontSize={12}
          tickFormatter={(value: number) => `${Math.round(value / 1000)}rb`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #3D4A41",
            borderRadius: 8,
            color: "#3D4A41",
          }}
          formatter={(value, name) => [
            formatRupiah(Number(value)),
            name === "omzet" ? "Omzet" : "Pengeluaran",
          ]}
        />
        <Legend
          formatter={(value) => (value === "omzet" ? "Omzet" : "Pengeluaran")}
        />
        <Bar dataKey="omzet" fill="#E89C65" radius={[6, 6, 0, 0]} />
        <Bar dataKey="pengeluaran" fill="#C0392B" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
