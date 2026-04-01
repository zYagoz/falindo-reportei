import type { GenderBreakdown } from "@/lib/types/instagram.types";
import { DonutChart } from "@/components/charts/DonutChart";

interface GenderDonutChartProps {
  data: GenderBreakdown;
}

export function GenderDonutChart({ data }: GenderDonutChartProps) {
  const chartData = [
    { name: "Masculino", value: data.M },
    { name: "Feminino", value: data.F },
    { name: "Não informado", value: data.U },
  ].filter((item) => item.value > 0);

  return (
    <div className="card-surface rounded-[28px] p-5">
      <h3 className="mb-2 text-lg font-semibold">Seguidores por gênero</h3>
      {chartData.length ? (
        <DonutChart data={chartData} dataKey="value" nameKey="name" />
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">Sem dados demográficos para o período.</p>
      )}
    </div>
  );
}
