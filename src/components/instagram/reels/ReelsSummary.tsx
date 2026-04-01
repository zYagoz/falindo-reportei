import type { InstagramReel } from "@/lib/types/instagram.types";
import { MetricCard } from "@/components/common/MetricCard";

interface ReelsSummaryProps {
  reels: InstagramReel[];
}

export function ReelsSummary({ reels }: ReelsSummaryProps) {
  const totals = reels.reduce(
    (accumulator, reel) => {
      accumulator.views += reel.insights.views;
      accumulator.reach += reel.insights.reach;
      accumulator.interactions += reel.insights.total_interactions;
      return accumulator;
    },
    { views: 0, reach: 0, interactions: 0 },
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard label="Visualizações" value={totals.views} />
      <MetricCard label="Reach" value={totals.reach} />
      <MetricCard label="Interações" value={totals.interactions} />
    </div>
  );
}
