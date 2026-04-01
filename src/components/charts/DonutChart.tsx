"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps<T> {
  data: T[];
  dataKey: keyof T;
  nameKey: keyof T;
}

const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"];

export function DonutChart<T extends Record<string, string | number>>({
  data,
  dataKey,
  nameKey,
}: DonutChartProps<T>) {
  return (
    <div className="h-72 min-h-72 min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
