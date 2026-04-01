"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LineChartProps<T> {
  data: T[];
  dataKey: keyof T;
  xKey: keyof T;
}

export function LineChart<T extends Record<string, string | number>>({
  data,
  dataKey,
  xKey,
}: LineChartProps<T>) {
  return (
    <div className="h-72 min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid stroke="rgba(249, 115, 22, 0.15)" strokeDasharray="4 4" />
          <XAxis dataKey={xKey as string} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line
            dataKey={dataKey as string}
            dot={false}
            stroke="var(--color-primary)"
            strokeWidth={3}
            type="monotone"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
