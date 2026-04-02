import { DonutChart } from "@/components/charts/DonutChart";
import type { GenderBreakdown } from "@/lib/types/instagram.types";

interface GenderDonutLegendChartProps {
  data: GenderBreakdown;
}

const GENDER_STYLES = {
  Masculino: {
    color: "#2563eb",
    accentClass: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    badgeClass: "bg-blue-500/12 text-blue-700",
  },
  Feminino: {
    color: "#ec4899",
    accentClass: "bg-pink-50 text-pink-700 ring-1 ring-pink-100",
    badgeClass: "bg-pink-500/12 text-pink-700",
  },
  "Não informado": {
    color: "#fdba74",
    accentClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    badgeClass: "bg-amber-500/12 text-amber-700",
  },
} as const;

export function GenderDonutLegendChart({ data }: GenderDonutLegendChartProps) {
  const chartData = [
    { name: "Masculino", value: data.M },
    { name: "Feminino", value: data.F },
    { name: "Não informado", value: data.U },
  ].filter((item) => item.value > 0);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const chartColors = chartData.map((item) => GENDER_STYLES[item.name as keyof typeof GENDER_STYLES].color);

  return (
    <div className="card-surface min-w-0 rounded-[28px] p-5">
      <h3 className="mb-2 text-lg font-semibold">Seguidores por gênero</h3>
      {chartData.length ? (
        <div className="grid items-center gap-6 xl:grid-cols-[minmax(280px,360px)_minmax(280px,340px)] xl:justify-between">
          <div className="mx-auto w-full max-w-[360px]">
            <DonutChart colors={chartColors} data={chartData} dataKey="value" nameKey="name" />
          </div>
          <div className="mx-auto grid w-full max-w-[340px] gap-3">
            {chartData.map((item) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const style = GENDER_STYLES[item.name as keyof typeof GENDER_STYLES];

              return (
                <div
                  key={item.name}
                  className={`min-w-0 rounded-2xl px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${style.accentClass}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: style.color }}
                      />
                      <span className="min-w-0 text-lg font-semibold">{item.name}</span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badgeClass}`}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid gap-1">
                    <strong className="text-2xl font-semibold text-[var(--color-text)]">
                      {item.value.toLocaleString("pt-BR")}
                    </strong>
                    <span className="min-w-0 break-words text-sm text-[var(--color-text-muted)]">seguidores</span>
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
