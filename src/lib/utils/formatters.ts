export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }

  return value.toLocaleString("pt-BR");
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function calculateEngagementRate(interactions: number, reach: number): number {
  if (!reach) {
    return 0;
  }

  return Number(((interactions / reach) * 100).toFixed(2));
}

export function calculateVariation(current: number, previous: number): number {
  if (!previous) {
    return 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(2));
}
