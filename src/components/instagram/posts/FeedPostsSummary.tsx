import { MetricCard } from "@/components/common/MetricCard";
import type { InstagramPost } from "@/lib/types/instagram.types";
import { calculateEngagementRate } from "@/lib/utils/formatters";

interface FeedPostsSummaryProps {
  posts: InstagramPost[];
  previousPosts?: InstagramPost[];
  profileVisits?: number;
  previousProfileVisits?: number;
}

function summarizePosts(posts: InstagramPost[]) {
  return posts.reduce(
    (accumulator, post) => {
      accumulator.shares += post.insights.shares;
      accumulator.follows += post.insights.follows;
      accumulator.interactions += post.insights.total_interactions;
      accumulator.reach += post.insights.reach;
      return accumulator;
    },
    { shares: 0, follows: 0, interactions: 0, reach: 0 },
  );
}

export function FeedPostsSummary({
  posts,
  previousPosts,
  profileVisits,
  previousProfileVisits,
}: FeedPostsSummaryProps) {
  const totals = summarizePosts(posts);
  const previousTotals = previousPosts ? summarizePosts(previousPosts) : null;
  const currentInteractionRate = calculateEngagementRate(totals.interactions, totals.reach);
  const previousInteractionRate = previousTotals
    ? calculateEngagementRate(previousTotals.interactions, previousTotals.reach)
    : undefined;

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      <MetricCard label="Compartilhamentos" previousValue={previousTotals?.shares} value={totals.shares} />
      <MetricCard label="Começaram a seguir" previousValue={previousTotals?.follows} value={totals.follows} />
      <MetricCard label="Visitas ao perfil" previousValue={previousProfileVisits} value={profileVisits ?? 0} />
      <MetricCard label="Posts no período" previousValue={previousPosts?.length} value={posts.length} />
      <MetricCard
        format="percent"
        label="Taxa de interação"
        previousValue={previousInteractionRate}
        value={currentInteractionRate}
      />
      <MetricCard label="Interações" previousValue={previousTotals?.interactions} value={totals.interactions} />
    </div>
  );
}
