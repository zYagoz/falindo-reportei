"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartContainerReady } from "@/lib/hooks/useChartContainerReady";

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
  const { containerRef, isReady, size } = useChartContainerReady<HTMLDivElement>();

  return (
    <div ref={containerRef} className="h-72 min-h-72 min-w-0 w-full">
      {isReady ? (
        <RechartsBarChart data={data} height={Math.floor(size.height)} width={Math.floor(size.width)}>
          <CartesianGrid stroke="rgba(249, 115, 22, 0.15)" strokeDasharray="4 4" />
          <XAxis dataKey={xKey as string} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey={dataKey as string} fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
        </RechartsBarChart>
      ) : null}
    </div>
  );
}
