import type { InstagramActivity } from "@/lib/types/instagram.types";
import { ActivityBarCard } from "./ActivityBarCard";

interface BestDayChartProps {
  activity: InstagramActivity;
}

export function BestDayChart({ activity }: BestDayChartProps) {
  return (
    <ActivityBarCard
      buckets={activity.days}
      description="Média diária de seguidores online agregada por dia da semana na janela disponível da Meta."
      effectiveSince={activity.effectiveSince}
      effectiveUntil={activity.effectiveUntil}
      emptyReason={activity.emptyReason}
      limitedToLast30Days={activity.limitedToLast30Days}
      title="Melhor dia para postagens"
    />
  );
}
