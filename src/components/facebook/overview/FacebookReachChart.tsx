import { LineChart } from "@/components/charts/LineChart";
import type { FacebookMetricPoint } from "@/lib/types/facebook.types";
import { formatDate } from "@/lib/utils/formatters";

interface FacebookReachChartProps {
  data: FacebookMetricPoint[];
}

export function FacebookReachChart({ data }: FacebookReachChartProps) {
  const chartData = data.map((item) => ({
    date: formatDate(item.end_time),
    value: item.value,
  }));

  return (
    <div className="card-surface rounded-[28px] p-5">
      <h3 className="mb-2 text-lg font-semibold">Visualizacoes ao longo do periodo</h3>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        Serie temporal diaria de page_media_view retornada pela Meta API.
      </p>
      {chartData.length ? (
        <LineChart data={chartData} dataKey="value" xKey="date" />
      ) : (
        <div className="flex h-72 items-center justify-center rounded-2xl bg-white/70 text-sm text-[var(--color-text-muted)]">
          Sem dados de visualizacoes para o periodo.
        </div>
      )}
    </div>
  );
}
