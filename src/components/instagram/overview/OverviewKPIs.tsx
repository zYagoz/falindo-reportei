import { Eye, Link2, TrendingUp, Users } from "lucide-react";
import type { InstagramAccount, InstagramInsights } from "@/lib/types/instagram.types";
import { MetricCard } from "@/components/common/MetricCard";

interface OverviewKPIsProps {
  account: InstagramAccount;
  insights: InstagramInsights;
  previousInsights?: InstagramInsights | null;
}

export function OverviewKPIs({ account, insights, previousInsights }: OverviewKPIsProps) {
  const currentNetFollowers = insights.follows_and_unfollows.net;
  const previousNetFollowers = previousInsights?.follows_and_unfollows.net;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={<Users />} label="Seguidores atuais" value={account.followers_count ?? 0} />
      <MetricCard
        icon={<TrendingUp />}
        label="Saldo de seguidores"
        previousValue={previousNetFollowers}
        value={currentNetFollowers}
      />
      <MetricCard icon={<Eye />} label="Visualizações" previousValue={previousInsights?.views} value={insights.views} />
      <MetricCard
        icon={<Link2 />}
        label="Toques no link"
        previousValue={previousInsights?.profile_links_taps}
        value={insights.profile_links_taps}
      />
    </div>
  );
}
