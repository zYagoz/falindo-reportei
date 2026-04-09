import type {
  DemographicData,
  InstagramActivity,
  InstagramAccount,
  InstagramInsights,
  InstagramOverviewAggregate,
  InstagramPost,
  InstagramReel,
  InstagramReelsAggregate,
  InstagramStoriesAggregate,
  PostInsights,
  ReelInsights,
} from "@/lib/types/instagram.types";
import { calculateEngagementRate } from "@/lib/utils/formatters";
import {
  buildInstagramActivity,
  parseReelsAggregate,
  parseDemographicsResponse,
  parseOnlineFollowersSeries,
  parseFollowsAndUnfollows,
  parseInsightsResponse,
  parseMetricAggregateTotal,
  parseMetricTotalValue,
  parsePostInsights,
  parseReelInsights,
  parseStoriesAggregate,
} from "@/lib/utils/metaApiHelpers";
import { metaFetch, metaFetchAbsolute } from "./client";

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
  media_type: "IMAGE" | "CAROUSEL_ALBUM" | "VIDEO" | "STORY";
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
};

type MetaUserResponse = {
  followers_count?: number;
};

type DateWindow = {
  since: string;
  until: string;
};

type OnlineFollowersResponse = {
  data?: Array<{
    values?: Array<{
      value?: number | Record<string, number>;
      end_time?: string;
    }>;
  }>;
  paging?: {
    previous?: string;
    next?: string;
  };
};

const MAX_INSIGHTS_WINDOW_DAYS = 30;
const ONLINE_FOLLOWERS_PAGE_LIMIT = 20;
const STORY_METRICS = ["reach", "replies", "views"] as const;

function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateParam(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function buildDateWindows(since: string, until: string): DateWindow[] {
  const windows: DateWindow[] = [];
  const rangeStart = toUtcDate(since);
  const rangeEnd = toUtcDate(until);

  let cursor = new Date(rangeStart);

  while (cursor <= rangeEnd) {
    const windowEnd = new Date(cursor);
    windowEnd.setUTCDate(windowEnd.getUTCDate() + (MAX_INSIGHTS_WINDOW_DAYS - 1));

    if (windowEnd > rangeEnd) {
      windowEnd.setTime(rangeEnd.getTime());
    }

    windows.push({
      since: toDateParam(cursor),
      until: toDateParam(windowEnd),
    });

    cursor = new Date(windowEnd);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return windows;
}

function isStoryMedia(media: MetaMedia): boolean {
  return media.media_product_type === "STORY" || media.media_type === "STORY";
}

function isFeedMedia(
  media: MetaMedia,
): media is MetaMedia & { media_type: "IMAGE" | "CAROUSEL_ALBUM" } {
  return media.media_type === "IMAGE" || media.media_type === "CAROUSEL_ALBUM";
}

function isReelMedia(media: MetaMedia): media is MetaMedia & { media_type: "VIDEO" } {
  return media.media_type === "VIDEO" && !isStoryMedia(media);
}

function createEmptyStoriesAggregate(emptyReason: string): InstagramStoriesAggregate {
  return {
    stories_count: 0,
    reach: 0,
    views: 0,
    replies: 0,
    taps_forward: 0,
    taps_back: 0,
    exits: 0,
    swipe_forward: 0,
    emptyReason,
  };
}

function isUnsupportedStoryMetricError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("not supported") ||
    message.includes("unsupported") ||
    message.includes("invalid metric") ||
    message.includes("cannot be queried") ||
    message.includes("must be one of")
  );
}

function isNotEnoughStoryViewersError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("Not enough viewers");
}

async function fetchStoryInsights(storyId: string): Promise<InstagramStoriesAggregate> {
  try {
    const [baseResponse, navigationResponse] = await Promise.all([
      metaFetch(`${storyId}/insights`, {
        params: {
          metric: STORY_METRICS.join(","),
        },
        revalidate: 1800,
      }),
      fetchStoryNavigation(storyId),
    ]);

    const mergedResponse = {
      data: [
        ...(typeof baseResponse === "object" && baseResponse && "data" in baseResponse
          ? ((baseResponse as { data?: unknown[] }).data ?? [])
          : []),
        ...(navigationResponse?.data ?? []),
      ],
    };

    return parseStoriesAggregate(1, mergedResponse);
  } catch (error) {
    if (isUnsupportedStoryMetricError(error) || isNotEnoughStoryViewersError(error)) {
      return createEmptyStoriesAggregate("A Meta nao disponibilizou insights utilizaveis para este story.");
    }

    throw error;
  }
}

async function fetchStoryNavigation(storyId: string): Promise<{ data?: unknown[] } | null> {
  try {
    return await metaFetch(`${storyId}/insights`, {
      params: {
        metric: "navigation",
        breakdown: "story_navigation_action_type",
      },
      revalidate: 1800,
    });
  } catch (error) {
    if (isUnsupportedStoryMetricError(error) || isNotEnoughStoryViewersError(error)) {
      return null;
    }

    throw error;
  }
}

function mergeStoriesAggregates(stories: InstagramStoriesAggregate[]): InstagramStoriesAggregate {
  return stories.reduce<InstagramStoriesAggregate>(
    (accumulator, current) => ({
      stories_count: accumulator.stories_count + current.stories_count,
      reach: accumulator.reach + current.reach,
      views: accumulator.views + current.views,
      replies: accumulator.replies + current.replies,
      taps_forward: accumulator.taps_forward + current.taps_forward,
      taps_back: accumulator.taps_back + current.taps_back,
      exits: accumulator.exits + current.exits,
      swipe_forward: accumulator.swipe_forward + current.swipe_forward,
    }),
    {
      stories_count: 0,
      reach: 0,
      views: 0,
      replies: 0,
      taps_forward: 0,
      taps_back: 0,
      exits: 0,
      swipe_forward: 0,
    },
  );
}

function countDistinctActivityDates(
  points: Array<{
    end_time: string;
  }>,
): number {
  return new Set(points.map((point) => point.end_time.slice(0, 10))).size;
}

async function fetchOnlineFollowersPages(accountId: string): Promise<OnlineFollowersResponse[]> {
  const pages: OnlineFollowersResponse[] = [];
  let currentPage = await metaFetch<OnlineFollowersResponse>(`${accountId}/insights`, {
    params: {
      metric: "online_followers",
      period: "lifetime",
    },
    revalidate: 1800,
  });

  pages.push(currentPage);

  let pageCount = 1;
  let distinctDates = countDistinctActivityDates(parseOnlineFollowersSeries(currentPage));

  while (currentPage.paging?.previous && distinctDates < 30 && pageCount < ONLINE_FOLLOWERS_PAGE_LIMIT) {
    currentPage = await metaFetchAbsolute<OnlineFollowersResponse>(currentPage.paging.previous, {
      revalidate: 1800,
    });
    pages.push(currentPage);
    pageCount += 1;
    distinctDates = countDistinctActivityDates(
      pages.flatMap((page) => parseOnlineFollowersSeries(page)),
    );
  }

  return pages;
}

async function fetchInsightsWindow(
  accountId: string,
  window: DateWindow,
): Promise<InstagramInsights> {
  const [totalValueResponse, timeSeriesResponse, followsResponse] = await Promise.all([
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "accounts_engaged,total_interactions,profile_links_taps,views",
        period: "day",
        metric_type: "total_value",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "reach",
        period: "day",
        metric_type: "time_series",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "follows_and_unfollows",
        period: "day",
        metric_type: "total_value",
        breakdown: "follow_type",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    }),
  ]);

  return parseInsightsResponse(totalValueResponse, timeSeriesResponse, followsResponse);
}

async function fetchOverviewWindow(
  accountId: string,
  window: DateWindow,
  followersCount: number,
): Promise<InstagramOverviewAggregate> {
  const [newFollowers, profileViewsResponse, reachResponse, linkTapsResponse] = await Promise.all([
    fetchOverviewNewFollowers(accountId, window),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "profile_views",
        period: "day",
        metric_type: "total_value",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "reach",
        period: "day",
        metric_type: "total_value",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "profile_links_taps",
        period: "day",
        metric_type: "total_value",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    }),
  ]);

  return {
    followers_count: followersCount,
    new_followers: newFollowers,
    profile_views: parseMetricAggregateTotal(profileViewsResponse, "profile_views"),
    profile_reach: parseMetricAggregateTotal(reachResponse, "reach"),
    profile_links_taps: parseMetricTotalValue(linkTapsResponse, "profile_links_taps"),
  };
}

function isFollowerCountTrailingWindowError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("(follower_count) metric only supports querying data for the last 30 days excluding the current day")
  );
}

async function fetchOverviewNewFollowers(accountId: string, window: DateWindow): Promise<number> {
  try {
    const followerCountResponse = await metaFetch(`${accountId}/insights`, {
      params: {
        metric: "follower_count",
        period: "day",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    });

    return parseMetricAggregateTotal(followerCountResponse, "follower_count");
  } catch (error) {
    if (!isFollowerCountTrailingWindowError(error)) {
      throw error;
    }

    const followsResponse = await metaFetch(`${accountId}/insights`, {
      params: {
        metric: "follows_and_unfollows",
        period: "day",
        metric_type: "total_value",
        breakdown: "follow_type",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    });

    return parseFollowsAndUnfollows(followsResponse).follows;
  }
}

async function fetchReelsAggregateWindow(
  accountId: string,
  window: DateWindow,
): Promise<InstagramReelsAggregate> {
  const [viewsResponse, reachResponse, interactionsResponse] = await Promise.all([
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "views",
        period: "day",
        metric_type: "total_value",
        breakdown: "media_product_type",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "reach",
        period: "day",
        metric_type: "total_value",
        breakdown: "media_product_type",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: "total_interactions",
        period: "day",
        metric_type: "total_value",
        breakdown: "media_product_type",
        since: window.since,
        until: window.until,
      },
      revalidate: 1800,
    }),
  ]);

  return parseReelsAggregate(viewsResponse, reachResponse, interactionsResponse);
}

function mergeInsights(windows: InstagramInsights[]): InstagramInsights {
  return windows.reduce<InstagramInsights>(
    (accumulator, current) => {
      accumulator.reach.push(...current.reach);
      accumulator.accounts_engaged += current.accounts_engaged;
      accumulator.total_interactions += current.total_interactions;
      accumulator.profile_links_taps += current.profile_links_taps;
      accumulator.views += current.views;
      accumulator.follows_and_unfollows.follows += current.follows_and_unfollows.follows;
      accumulator.follows_and_unfollows.unfollows += current.follows_and_unfollows.unfollows;
      accumulator.follows_and_unfollows.net += current.follows_and_unfollows.net;

      return accumulator;
    },
    {
      reach: [],
      accounts_engaged: 0,
      total_interactions: 0,
      profile_links_taps: 0,
      views: 0,
      follows_and_unfollows: {
        follows: 0,
        unfollows: 0,
        net: 0,
      },
    },
  );
}

function mergeOverviewAggregates(
  followersCount: number,
  windows: InstagramOverviewAggregate[],
): InstagramOverviewAggregate {
  return windows.reduce<InstagramOverviewAggregate>(
    (accumulator, current) => {
      accumulator.new_followers += current.new_followers;
      accumulator.profile_views += current.profile_views;
      accumulator.profile_reach += current.profile_reach;
      accumulator.profile_links_taps += current.profile_links_taps;
      return accumulator;
    },
    {
      followers_count: followersCount,
      new_followers: 0,
      profile_views: 0,
      profile_reach: 0,
      profile_links_taps: 0,
    },
  );
}

function mergeReelsAggregates(windows: InstagramReelsAggregate[]): InstagramReelsAggregate {
  const totals = windows.reduce(
    (accumulator, current) => {
      accumulator.views += current.views;
      accumulator.reach += current.reach;
      accumulator.total_interactions += current.total_interactions;
      return accumulator;
    },
    { views: 0, reach: 0, total_interactions: 0 },
  );

  return {
    ...totals,
    engagement_rate: totals.reach
      ? Number(((totals.total_interactions / totals.reach) * 100).toFixed(2))
      : 0,
  };
}

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

export async function fetchOverviewAggregate(
  accountId: string,
  since: string,
  until: string,
): Promise<InstagramOverviewAggregate> {
  const userResponse = await metaFetch<MetaUserResponse>(accountId, {
    params: {
      fields: "followers_count",
    },
    revalidate: 1800,
  });
  const followersCount = userResponse.followers_count ?? 0;
  const windows = buildDateWindows(since, until);
  const overviewByWindow = await Promise.all(
    windows.map((window) => fetchOverviewWindow(accountId, window, followersCount)),
  );

  return mergeOverviewAggregates(followersCount, overviewByWindow);
}

export async function fetchAccountInsights(
  accountId: string,
  since: string,
  until: string,
): Promise<InstagramInsights> {
  const windows = buildDateWindows(since, until);
  const insightsByWindow = await Promise.all(windows.map((window) => fetchInsightsWindow(accountId, window)));
  const mergedInsights = mergeInsights(insightsByWindow);

  return {
    ...mergedInsights,
    reach: mergedInsights.reach.sort(
      (left, right) => new Date(left.end_time).getTime() - new Date(right.end_time).getTime(),
    ),
  };
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
      fields: "id,caption,media_type,media_product_type,thumbnail_url,media_url,timestamp",
      since,
      until,
      limit: "50",
    },
    revalidate: 1800,
  });

  return Promise.all(
    postsResponse.data
      .filter(isFeedMedia)
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
      fields: "id,caption,thumbnail_url,timestamp,media_type,media_product_type",
      since,
      until,
      limit: "50",
    },
    revalidate: 1800,
  });

  return Promise.all(
    reelsResponse.data
      .filter(isReelMedia)
      .map(async (reel) => ({
        id: reel.id,
        caption: reel.caption,
        thumbnail_url: reel.thumbnail_url,
        timestamp: reel.timestamp,
        insights: await fetchReelInsights(reel.id),
      })),
  );
}

export async function fetchStories(accountId: string): Promise<InstagramStoriesAggregate> {
  const storiesResponse = await metaFetch<{ data: MetaMedia[] }>(`${accountId}/stories`, {
    params: {
      fields: "id,caption,media_type,media_product_type,timestamp",
      limit: "25",
    },
    revalidate: 900,
  });

  const stories = storiesResponse.data.filter(isStoryMedia);

  if (!stories.length) {
    return createEmptyStoriesAggregate("Nenhum story ativo ou recente encontrado.");
  }

  const summary = mergeStoriesAggregates(await Promise.all(stories.map((story) => fetchStoryInsights(story.id))));

  if (
    !summary.reach &&
    !summary.views &&
    !summary.replies &&
    !summary.taps_forward &&
    !summary.taps_back &&
    !summary.exits &&
    !summary.swipe_forward
  ) {
    return {
      ...summary,
      emptyReason: "A Meta nao disponibilizou insights utilizaveis para os stories recentes desta conta.",
    };
  }

  return summary;
}

export async function fetchReelsAggregate(
  accountId: string,
  since: string,
  until: string,
): Promise<InstagramReelsAggregate> {
  const windows = buildDateWindows(since, until);
  const aggregates = await Promise.all(
    windows.map((window) => fetchReelsAggregateWindow(accountId, window)),
  );

  return mergeReelsAggregates(aggregates);
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

export async function fetchOnlineFollowersActivity(
  accountId: string,
  since: string,
  until: string,
): Promise<InstagramActivity> {
  try {
    const responses = await fetchOnlineFollowersPages(accountId);
    const points = responses.flatMap((response) => parseOnlineFollowersSeries(response));

    return buildInstagramActivity(points, since, until);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.toLowerCase().includes("100 followers") ||
        error.message.toLowerCase().includes("online_followers") ||
        error.message.toLowerCase().includes("not enough"))
    ) {
      return {
        ...buildInstagramActivity([], since, until),
        emptyReason: "Dados indisponíveis para contas com menos de 100 seguidores.",
      };
    }

    throw error;
  }
}
