export interface DateRange {
  since: string;
  until: string;
  label: string;
}

export interface DatePreset {
  label: string;
  kind: "days" | "calendar";
  days?: number;
  calendarRange?: "current_month" | "previous_month";
}

export interface MetricVariation {
  current: number;
  previous: number;
  changePercent: number;
  changeAbsolute: number;
}

export interface SocialAccount {
  id: string;
  name: string;
  username?: string;
  picture_url?: string;
  profile_picture_url?: string;
}

export type TimeframeOption = "this_month" | "this_week";

export type Platform = "instagram" | "facebook" | "linkedin";
