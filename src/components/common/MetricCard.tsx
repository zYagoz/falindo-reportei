import type { ReactNode } from "react";
import { formatFullNumber, formatPercent } from "@/lib/utils/formatters";
import { VariationBadge } from "./VariationBadge";

interface MetricCardProps {
  label: string;
  value: number | string;
  previousValue?: number;
  format?: "number" | "percent" | "currency";
  icon?: ReactNode;
}

function formatValue(value: number | string, format: MetricCardProps["format"] = "number") {
  if (typeof value === "string") {
    return value;
  }

  if (format === "percent") {
    return formatPercent(value);
  }

  return formatFullNumber(value);
}

export function MetricCard({ label, value, previousValue, format = "number", icon }: MetricCardProps) {
  return (
    <article className="card-surface rounded-[24px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
          <strong className="mt-2 block text-3xl font-semibold text-[var(--color-text)]">
            {formatValue(value, format)}
          </strong>
        </div>
        {icon ? <div className="text-[var(--color-primary)]">{icon}</div> : null}
      </div>
      {typeof value === "number" && previousValue !== undefined ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <VariationBadge current={value} previous={previousValue} />
          <span className="text-xs text-[var(--color-text-muted)] sm:text-right">
            Base anterior: {formatFullNumber(previousValue)}
          </span>
        </div>
      ) : null}
    </article>
  );
}
