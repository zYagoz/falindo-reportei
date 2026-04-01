import { GenderDonutLegendChart } from "./GenderDonutLegendChart";
import type { GenderBreakdown } from "@/lib/types/instagram.types";

interface GenderDonutChartProps {
  data: GenderBreakdown;
}

export function GenderDonutChart({ data }: GenderDonutChartProps) {
  return <GenderDonutLegendChart data={data} />;
}
