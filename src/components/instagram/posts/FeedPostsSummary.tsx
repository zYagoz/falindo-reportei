import type { InstagramPost } from "@/lib/types/instagram.types";
import { MetricCard } from "@/components/common/MetricCard";

interface FeedPostsSummaryProps {
  posts: InstagramPost[];
}

export function FeedPostsSummary({ posts }: FeedPostsSummaryProps) {
  const totals = posts.reduce(
    (accumulator, post) => {
      accumulator.likes += post.insights.likes;
      accumulator.comments += post.insights.comments;
      accumulator.saved += post.insights.saved;
      accumulator.interactions += post.insights.total_interactions;
      return accumulator;
    },
    { likes: 0, comments: 0, saved: 0, interactions: 0 },
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Curtidas" value={totals.likes} />
      <MetricCard label="Comentários" value={totals.comments} />
      <MetricCard label="Salvos" value={totals.saved} />
      <MetricCard label="Interações" value={totals.interactions} />
    </div>
  );
}
