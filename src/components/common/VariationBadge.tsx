import { calculateVariation, formatPercent } from "@/lib/utils/formatters";

interface VariationBadgeProps {
  current: number;
  previous: number;
}

export function VariationBadge({ current, previous }: VariationBadgeProps) {
  const change = calculateVariation(current, previous);
  const positive = change >= 0;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        positive
          ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
          : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
      }`}
    >
      {formatPercent(change)}
    </span>
  );
}
