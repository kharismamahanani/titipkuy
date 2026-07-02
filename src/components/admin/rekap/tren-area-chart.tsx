"use client";

import { format, parse } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah } from "@/lib/utils";
import type { TrenBulan } from "@/types/rekap";

export function TrenAreaChart({ data }: { data: TrenBulan[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(parse(d.bulan, "yyyy-MM", new Date()), "MMM yyyy", { locale: localeId }),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <defs>
          <linearGradient id="trenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8337C" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#6C3FC4" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <YAxis
          stroke="rgba(255,255,255,0.5)"
          fontSize={12}
          tickFormatter={(value: number) => `${Math.round(value / 1000)}rb`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1A1A2E",
            border: "1px solid rgba(108,63,196,0.3)",
            borderRadius: 8,
            color: "#fff",
          }}
          formatter={(value) => [formatRupiah(Number(value)), "Omzet"]}
        />
        <Area
          type="monotone"
          dataKey="omzet"
          stroke="#E8337C"
          strokeWidth={2}
          fill="url(#trenGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
