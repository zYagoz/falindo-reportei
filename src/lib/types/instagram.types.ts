export interface InstagramAccount {
  id: string;
  name: string;
  username: string;
  profile_picture_url?: string;
  followers_count?: number;
  pageId: string;
  pageName: string;
}

export interface MetricDataPoint {
  value: number;
  end_time: string;
}

export interface FollowsData {
  follows: number;
  unfollows: number;
  net: number;
}

export interface InstagramInsights {
  reach: MetricDataPoint[];
  accounts_engaged: number;
  total_interactions: number;
  follows_and_unfollows: FollowsData;
  profile_links_taps: number;
  views: number;
}

export interface PostInsights {
  views: number;
  reach: number;
  likes: number;
  comments: number;
  saved: number;
  shares: number;
  follows: number;
  total_interactions: number;
  engagement_rate: number;
}

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "CAROUSEL_ALBUM" | "VIDEO";
  thumbnail_url?: string;
  media_url?: string;
  timestamp: string;
  insights: PostInsights;
}

export interface ReelInsights {
  views: number;
  reach: number;
  likes: number;
  comments: number;
  saved: number;
  shares: number;
  total_interactions: number;
  engagement_rate: number;
}

export interface InstagramReel {
  id: string;
  caption?: string;
  thumbnail_url?: string;
  timestamp: string;
  insights: ReelInsights;
}

export interface GenderBreakdown {
  M: number;
  F: number;
  U: number;
}

export interface CityBreakdown {
  city: string;
  value: number;
}

export interface AgeBreakdown {
  range: string;
  M: number;
  F: number;
  U: number;
}

export interface DemographicData {
  followers_by_gender: GenderBreakdown;
  followers_by_city: CityBreakdown[];
  reached_by_age: AgeBreakdown[];
  engaged_by_age?: AgeBreakdown[];
}
