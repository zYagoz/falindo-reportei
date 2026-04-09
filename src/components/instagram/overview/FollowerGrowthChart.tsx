import type { MetricDataPoint } from "@/lib/types/instagram.types";
import { formatDate } from "@/lib/utils/formatters";
import { LineChart } from "@/components/charts/LineChart";

interface FollowerGrowthChartProps {
  data: MetricDataPoint[];
}

export function FollowerGrowthChart({ data }: FollowerGrowthChartProps) {
  const chartData = data.map((item) => ({
    date: formatDate(item.end_time),
    value: item.value,
  }));

  return (
    <div className="card-surface h-fit self-start rounded-[28px] p-5">
      <h3 className="mb-2 text-lg font-semibold">Alcance ao longo do período</h3>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        Série temporal de alcance diário retornada pela Meta API.
      </p>
      {chartData.length ? (
        <LineChart data={chartData} dataKey="value" xKey="date" />
      ) : (
        <div className="flex h-72 items-center justify-center rounded-2xl bg-white/70 text-sm text-[var(--color-text-muted)]">
          Sem dados de alcance para o período.
        </div>
      )}
    </div>
  );
}
