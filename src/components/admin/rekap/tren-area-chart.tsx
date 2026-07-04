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
            <stop offset="0%" stopColor="#7FA99B" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#7FA99B" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#D6CEC4" vertical={false} />
        <XAxis dataKey="label" stroke="#3D4A41" fontSize={12} />
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
          formatter={(value) => [formatRupiah(Number(value)), "Omzet"]}
        />
        <Area
          type="monotone"
          dataKey="omzet"
          stroke="#5D8A7B"
          strokeWidth={2}
          fill="url(#trenGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
