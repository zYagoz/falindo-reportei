import type {
  DemographicData,
  InstagramAccount,
  InstagramInsights,
  InstagramPost,
  InstagramReel,
  PostInsights,
  ReelInsights,
} from "@/lib/types/instagram.types";
import { calculateEngagementRate } from "@/lib/utils/formatters";
import {
  parseDemographicsResponse,
  parseInsightsResponse,
  parsePostInsights,
  parseReelInsights,
} from "@/lib/utils/metaApiHelpers";
import { metaFetch } from "./client";

type FacebookPage = {
  id: string;
  name: string;
  instagram_business_account?: {
    id: string;
    name?: string;
    username: string;
    profile_picture_url?: string;
    followers_count?: number;
  };
};

type MetaMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "CAROUSEL_ALBUM" | "VIDEO";
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
};

export async function fetchInstagramAccounts(): Promise<InstagramAccount[]> {
  const pagesResponse = await metaFetch<{ data: FacebookPage[] }>("me/accounts", {
    params: {
      fields:
        "id,name,instagram_business_account{id,name,username,profile_picture_url,followers_count}",
    },
    revalidate: 3600,
  });

  return pagesResponse.data
    .filter((page) => page.instagram_business_account)
    .map((page) => ({
      id: page.instagram_business_account!.id,
      name: page.instagram_business_account!.name || page.name,
      username: page.instagram_business_account!.username,
      profile_picture_url: page.instagram_business_account!.profile_picture_url,
      followers_count: page.instagram_business_account!.followers_count,
      pageId: page.id,
      pageName: page.name,
    }));
}

export async function fetchAccountInsights(
  accountId: string,
  since: string,
  until: string,
): Promise<InstagramInsights> {
  const [totalValueResponse, timeSeriesResponse, followsResponse] = await Promise.all([
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "accounts_engaged,total_interactions,profile_links_taps,views",
        period: "day",
        metric_type: "total_value",
        since,
        until,
      },
      revalidate: 1800,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "reach",
        period: "day",
        metric_type: "time_series",
        since,
        until,
      },
      revalidate: 1800,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "follows_and_unfollows",
        period: "day",
        metric_type: "total_value",
        breakdown: "follow_type",
        since,
        until,
      },
      revalidate: 1800,
    }),
  ]);

  return parseInsightsResponse(totalValueResponse, timeSeriesResponse, followsResponse);
}

export async function fetchDemographics(
  accountId: string,
  timeframe: "this_month" | "this_week" = "this_month",
): Promise<DemographicData> {
  try {
    const [followersGender, followersCity, reachedAge] = await Promise.all([
      metaFetch(`${accountId}/insights`, {
        params: {
          metric: "follower_demographics",
          period: "lifetime",
          timeframe,
          breakdown: "gender",
          metric_type: "total_value",
        },
        revalidate: 3600,
      }),
      metaFetch(`${accountId}/insights`, {
        params: {
          metric: "follower_demographics",
          period: "lifetime",
          timeframe,
          breakdown: "city",
          metric_type: "total_value",
        },
        revalidate: 3600,
      }),
      metaFetch(`${accountId}/insights`, {
        params: {
          metric: "reached_audience_demographics",
          period: "lifetime",
          timeframe,
          breakdown: "age",
          metric_type: "total_value",
        },
        revalidate: 3600,
      }),
    ]);

    return parseDemographicsResponse(followersGender, followersCity, reachedAge);
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("not enough users")) {
      return {
        followers_by_gender: { M: 0, F: 0, U: 0 },
        followers_by_city: [],
        reached_by_age: [],
        engaged_by_age: [],
      };
    }

    throw error;
  }
}

export async function fetchFeedPosts(
  accountId: string,
  since: string,
  until: string,
): Promise<InstagramPost[]> {
  const postsResponse = await metaFetch<{ data: MetaMedia[] }>(`${accountId}/media`, {
    params: {
      fields: "id,caption,media_type,thumbnail_url,media_url,timestamp",
      since,
      until,
      limit: "50",
    },
    revalidate: 1800,
  });

  return Promise.all(
    postsResponse.data
      .filter((post) => post.media_type !== "VIDEO")
      .map(async (post) => {
        const insights = await fetchPostInsights(post.id);
        return {
          ...post,
          insights,
        };
      }),
  );
}

export async function fetchPostInsights(postId: string): Promise<PostInsights> {
  const response = await metaFetch(`${postId}/insights`, {
    params: {
      metric: "reach,likes,comments,saved,shares,follows,total_interactions",
    },
    revalidate: 1800,
  });

  const parsed = parsePostInsights(response);

  return {
    ...parsed,
    engagement_rate: calculateEngagementRate(parsed.total_interactions, parsed.reach),
  };
}

export async function fetchReels(
  accountId: string,
  since: string,
  until: string,
): Promise<InstagramReel[]> {
  const reelsResponse = await metaFetch<{ data: MetaMedia[] }>(`${accountId}/media`, {
    params: {
      fields: "id,caption,thumbnail_url,timestamp,media_type",
      since,
      until,
      limit: "50",
    },
    revalidate: 1800,
  });

  return Promise.all(
    reelsResponse.data
      .filter((media) => media.media_type === "VIDEO")
      .map(async (reel) => ({
        id: reel.id,
        caption: reel.caption,
        thumbnail_url: reel.thumbnail_url,
        timestamp: reel.timestamp,
        insights: await fetchReelInsights(reel.id),
      })),
  );
}

export async function fetchReelInsights(reelId: string): Promise<ReelInsights> {
  const response = await metaFetch(`${reelId}/insights`, {
    params: {
      metric: "views,reach,likes,comments,saved,shares,total_interactions",
    },
    revalidate: 1800,
  });

  const parsed = parseReelInsights(response);

  return {
    ...parsed,
    engagement_rate: calculateEngagementRate(parsed.total_interactions, parsed.reach),
  };
}
