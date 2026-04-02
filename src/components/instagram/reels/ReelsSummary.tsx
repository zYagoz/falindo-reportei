import { MetricCard } from "@/components/common/MetricCard";
import type { InstagramReel, InstagramReelsAggregate } from "@/lib/types/instagram.types";

interface ReelsSummaryProps {
  reels: InstagramReel[];
  summary: InstagramReelsAggregate;
  previousSummary?: InstagramReelsAggregate;
  previousReels?: InstagramReel[];
}

export function ReelsSummary({
  reels,
  summary,
  previousReels,
  previousSummary,
}: ReelsSummaryProps) {
  const hasPreviousSummary = Boolean(previousSummary);

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
      <MetricCard label="Reels no período" previousValue={previousReels?.length} value={reels.length} />
      <MetricCard label="Visualizações" previousValue={hasPreviousSummary ? previousSummary?.views : undefined} value={summary.views} />
      <MetricCard label="Alcance" previousValue={hasPreviousSummary ? previousSummary?.reach : undefined} value={summary.reach} />
      <MetricCard
        label="Interações"
        previousValue={hasPreviousSummary ? previousSummary?.total_interactions : undefined}
        value={summary.total_interactions}
      />
      <MetricCard
        format="percent"
        label="Taxa de interação"
        previousValue={hasPreviousSummary ? previousSummary?.engagement_rate : undefined}
        value={summary.engagement_rate}
      />
    </div>
  );
}
