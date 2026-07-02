"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah } from "@/lib/utils";
import type { BreakdownPaket } from "@/types/rekap";

export function OmzetBarChart({ data }: { data: BreakdownPaket[] }) {
  if (data.length === 0) {
    return (
      <p className="flex h-[280px] items-center justify-center text-sm text-foreground/50">
        Belum ada omzet bulan ini.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <defs>
          <linearGradient id="omzetPaketGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C3FC4" />
            <stop offset="100%" stopColor="#E8337C" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="nama" stroke="rgba(255,255,255,0.5)" fontSize={12} />
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
        <Bar dataKey="omzet" fill="url(#omzetPaketGradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
