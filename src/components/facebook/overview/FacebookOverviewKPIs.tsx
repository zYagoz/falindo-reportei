import { Eye, Footprints, MessageCircleMore, TrendingUp, Users } from "lucide-react";
import { MetricCard } from "@/components/common/MetricCard";
import type { FacebookOverviewAggregate } from "@/lib/types/facebook.types";

interface FacebookOverviewKPIsProps {
  overview: FacebookOverviewAggregate;
  previousOverview?: FacebookOverviewAggregate | null;
}

export function FacebookOverviewKPIs({ overview, previousOverview }: FacebookOverviewKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard icon={<Users />} label="Seguidores atuais" value={overview.followers_total} />
      <MetricCard
        icon={<TrendingUp />}
        label="Seguidores liquidos"
        previousValue={previousOverview?.net_followers}
        value={overview.net_followers}
      />
      <MetricCard
        icon={<Eye />}
        label="Visualizacoes"
        previousValue={previousOverview?.views}
        value={overview.views}
      />
      <MetricCard
        icon={<Footprints />}
        label="Visitas ao Facebook"
        previousValue={previousOverview?.page_visits}
        value={overview.page_visits}
      />
      <MetricCard
        icon={<MessageCircleMore />}
        label="Interacoes com o conteudo"
        previousValue={previousOverview?.content_interactions}
        value={overview.content_interactions}
      />
    </div>
  );
}
