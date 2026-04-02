import { Eye, Link2, TrendingUp, Users } from "lucide-react";
import type { InstagramOverviewAggregate } from "@/lib/types/instagram.types";
import { MetricCard } from "@/components/common/MetricCard";

interface OverviewKPIsProps {
  overview: InstagramOverviewAggregate;
  previousOverview?: InstagramOverviewAggregate | null;
}

export function OverviewKPIs({ overview, previousOverview }: OverviewKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard icon={<Users />} label="Seguidores atuais" value={overview.followers_count} />
      <MetricCard
        icon={<TrendingUp />}
        label="Novos seguidores no período"
        previousValue={previousOverview?.new_followers}
        value={overview.new_followers}
      />
      <MetricCard
        icon={<Eye />}
        label="Visitas ao perfil"
        previousValue={previousOverview?.profile_views}
        value={overview.profile_views}
      />
      <MetricCard
        icon={<Eye />}
        label="Alcance do perfil"
        previousValue={previousOverview?.profile_reach}
        value={overview.profile_reach}
      />
      <MetricCard
        icon={<Link2 />}
        label="Cliques no link"
        previousValue={previousOverview?.profile_links_taps}
        value={overview.profile_links_taps}
      />
    </div>
  );
}
