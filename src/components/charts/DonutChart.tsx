"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { useChartContainerReady } from "@/lib/hooks/useChartContainerReady";

interface DonutChartProps<T> {
  data: T[];
  dataKey: keyof T;
  nameKey: keyof T;
  colors?: string[];
}

const DEFAULT_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"];

export function DonutChart<T extends Record<string, string | number>>({
  data,
  dataKey,
  nameKey,
  colors = DEFAULT_COLORS,
}: DonutChartProps<T>) {
  const { containerRef, isReady, size } = useChartContainerReady<HTMLDivElement>();

  return (
    <div ref={containerRef} className="h-72 min-h-72 min-w-0 w-full">
      {isReady ? (
        <PieChart height={Math.floor(size.height)} width={Math.floor(size.width)}>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey={dataKey as string}
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            nameKey={nameKey as string}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      ) : null}
    </div>
  );
}
