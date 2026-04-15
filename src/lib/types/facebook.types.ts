import type { SocialAccount } from "./common.types";

export interface FacebookPage extends SocialAccount {
  category?: string;
}

export interface FacebookMetricPoint {
  value: number;
  end_time: string;
}

export interface FacebookInsights {
  views: FacebookMetricPoint[];
}

export interface FacebookOverviewAggregate {
  followers_total: number;
  fan_count: number;
  follows: number;
  unfollows: number;
  net_followers: number;
  views: number;
  page_visits: number;
  content_interactions: number;
  insights_available: boolean;
  insights_unavailable_reason?: string;
}
