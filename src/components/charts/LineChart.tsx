"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartContainerReady } from "@/lib/hooks/useChartContainerReady";

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
  const { containerRef, isReady, size } = useChartContainerReady<HTMLDivElement>();

  return (
    <div ref={containerRef} className="h-72 min-h-72 min-w-0 w-full">
      {isReady ? (
        <RechartsLineChart data={data} height={Math.floor(size.height)} width={Math.floor(size.width)}>
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
      ) : null}
    </div>
  );
}
