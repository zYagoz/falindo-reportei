"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartProps<T> {
  data: T[];
  dataKey: keyof T;
  xKey: keyof T;
}

export function BarChart<T extends Record<string, string | number>>({
  data,
  dataKey,
  xKey,
}: BarChartProps<T>) {
  return (
    <div className="h-72 min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid stroke="rgba(249, 115, 22, 0.15)" strokeDasharray="4 4" />
          <XAxis dataKey={xKey as string} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey={dataKey as string} fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
