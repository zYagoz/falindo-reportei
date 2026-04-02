import type { InstagramActivity } from "@/lib/types/instagram.types";
import { ActivityBarCard } from "./ActivityBarCard";

interface BestHourChartProps {
  activity: InstagramActivity;
}

export function BestHourChart({ activity }: BestHourChartProps) {
  return (
    <ActivityBarCard
      buckets={activity.hours}
      description="Média de seguidores online por faixa horária na janela disponível da Meta."
      effectiveSince={activity.effectiveSince}
      effectiveUntil={activity.effectiveUntil}
      emptyReason={activity.emptyReason}
      limitedToLast30Days={activity.limitedToLast30Days}
      title="Melhor horário para postagens"
    />
  );
}
