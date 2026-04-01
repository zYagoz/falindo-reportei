export interface DateRange {
  since: string;
  until: string;
  label: string;
}

export interface MetricVariation {
  current: number;
  previous: number;
  changePercent: number;
  changeAbsolute: number;
}

export type TimeframeOption = "this_month" | "this_week";

export type Platform = "instagram" | "facebook" | "linkedin";
