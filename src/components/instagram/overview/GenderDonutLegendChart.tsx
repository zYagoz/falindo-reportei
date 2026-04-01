import { DonutChart } from "@/components/charts/DonutChart";
import type { GenderBreakdown } from "@/lib/types/instagram.types";

interface GenderDonutLegendChartProps {
  data: GenderBreakdown;
}

const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"];

export function GenderDonutLegendChart({ data }: GenderDonutLegendChartProps) {
  const chartData = [
    { name: "Masculino", value: data.M },
    { name: "Feminino", value: data.F },
    { name: "Não informado", value: data.U },
  ].filter((item) => item.value > 0);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card-surface min-w-0 rounded-[28px] p-5">
      <h3 className="mb-2 text-lg font-semibold">Seguidores por gênero</h3>
      {chartData.length ? (
        <div className="grid items-center gap-6 xl:grid-cols-[minmax(280px,360px)_minmax(280px,340px)] xl:justify-between">
          <div className="mx-auto w-full max-w-[360px]">
            <DonutChart data={chartData} dataKey="value" nameKey="name" />
          </div>
          <div className="mx-auto grid w-full max-w-[340px] gap-3">
            {chartData.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;

              return (
                <div key={item.name} className="min-w-0 rounded-2xl bg-white/80 px-4 py-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="min-w-0 text-lg font-semibold text-[var(--color-text)]">{item.name}</span>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 text-sm text-[var(--color-text-muted)]">
                    <span className="min-w-0 break-words">{item.value.toLocaleString("pt-BR")} seguidores</span>
                    <span className="shrink-0 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">Sem dados demográficos para o período.</p>
      )}
    </div>
  );
}
