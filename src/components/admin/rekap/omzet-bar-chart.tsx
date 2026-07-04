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
      <p className="flex h-[280px] items-center justify-center text-sm text-tk-light">
        Belum ada omzet bulan ini.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D6CEC4" vertical={false} />
        <XAxis dataKey="nama" stroke="#3D4A41" fontSize={12} />
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
        <Bar dataKey="omzet" fill="#E89C65" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
