import type {
  ActivityBucket,
  DemographicData,
  InstagramActivity,
  InstagramAccount,
  InstagramInsights,
  InstagramOverviewAggregate,
  InstagramPost,
  InstagramReel,
  InstagramReelsAggregate,
  InstagramStoriesAggregate,
} from "@/lib/types/instagram.types";

export const instagramAccountsFixture: InstagramAccount[] = [
  {
    id: "ig-1",
    name: "Hazel Studio",
    username: "hazelstudio",
    profile_picture_url: "https://images.example.com/hazel.jpg",
    followers_count: 12500,
    pageId: "page-1",
    pageName: "Hazel Studio",
  },
  {
    id: "ig-2",
    name: "Nova Agency",
    username: "novaagency",
    pageId: "page-2",
    pageName: "Nova Agency",
  },
];

export const insightsFixture: InstagramInsights = {
  accounts_engaged: 3200,
  total_interactions: 940,
  profile_links_taps: 88,
  views: 18200,
  follows_and_unfollows: {
    follows: 120,
    unfollows: 20,
    net: 100,
  },
  reach: [
    { end_time: "2026-03-30T00:00:00+0000", value: 4800 },
    { end_time: "2026-03-31T00:00:00+0000", value: 5100 },
    { end_time: "2026-04-01T00:00:00+0000", value: 5300 },
  ],
};

export const overviewFixture: InstagramOverviewAggregate = {
  followers_count: 3979,
  new_followers: 120,
  profile_views: 18200,
  profile_reach: 9500,
  profile_links_taps: 88,
};

export const previousOverviewFixture: InstagramOverviewAggregate = {
  followers_count: 3910,
  new_followers: 84,
  profile_views: 13600,
  profile_reach: 7200,
  profile_links_taps: 42,
};

export const demographicsFixture: DemographicData = {
  followers_by_gender: { M: 40, F: 54, U: 6 },
  followers_by_city: [
    { city: "São Paulo", value: 3200 },
    { city: "Rio de Janeiro", value: 1800 },
  ],
  reached_by_age: [
    { range: "18-24", M: 320, F: 410, U: 0 },
    { range: "25-34", M: 510, F: 680, U: 12 },
  ],
  engaged_by_age: [],
};

export const postsFixture: InstagramPost[] = [
  {
    id: "post-1",
    caption: "Campanha lançamento",
    media_type: "IMAGE",
    media_url: "https://images.example.com/post-1.jpg",
    timestamp: "2026-04-01T10:00:00.000Z",
    insights: {
      views: 0,
      reach: 2500,
      likes: 240,
      comments: 18,
      saved: 34,
      shares: 21,
      follows: 12,
      total_interactions: 313,
      engagement_rate: 12.52,
    },
  },
  {
    id: "post-2",
    caption: "Bastidores",
    media_type: "CAROUSEL_ALBUM",
    media_url: "https://images.example.com/post-2.jpg",
    timestamp: "2026-03-28T12:00:00.000Z",
    insights: {
      views: 0,
      reach: 1900,
      likes: 160,
      comments: 12,
      saved: 18,
      shares: 14,
      follows: 5,
      total_interactions: 204,
      engagement_rate: 10.74,
    },
  },
];

export const reelsFixture: InstagramReel[] = [
  {
    id: "reel-1",
    caption: "Reel de tendência",
    thumbnail_url: "https://images.example.com/reel-1.jpg",
    timestamp: "2026-03-30T09:00:00.000Z",
    insights: {
      views: 12000,
      reach: 6500,
      likes: 390,
      comments: 44,
      saved: 65,
      shares: 51,
      total_interactions: 550,
      engagement_rate: 8.46,
    },
  },
];

export const reelsSummaryFixture: InstagramReelsAggregate = {
  views: 17295,
  reach: 3444,
  total_interactions: 500,
  engagement_rate: 14.52,
};

export const previousReelsSummaryFixture: InstagramReelsAggregate = {
  views: 7299,
  reach: 1503,
  total_interactions: 80,
  engagement_rate: 5.32,
};

export const storiesFixture: InstagramStoriesAggregate = {
  stories_count: 3,
  reach: 1240,
  views: 3580,
  replies: 18,
  taps_forward: 520,
  taps_back: 97,
  exits: 46,
  swipe_forward: 10,
};

function createActivityBucket(
  label: string,
  value: number,
  sampleCount: number,
  totalValue: number,
  highlighted = false,
): ActivityBucket {
  return { label, value, sampleCount, totalValue, highlighted };
}

export const activityFixture: InstagramActivity = {
  bestDay: createActivityBucket("Qua", 108, 4, 432, true),
  bestHour: createActivityBucket("7h", 96, 4, 384, true),
  days: [
    createActivityBucket("Dom", 88, 4, 352),
    createActivityBucket("Seg", 94, 4, 376),
    createActivityBucket("Ter", 82, 4, 328),
    createActivityBucket("Qua", 108, 4, 432, true),
    createActivityBucket("Qui", 84, 4, 336),
    createActivityBucket("Sex", 78, 4, 312),
    createActivityBucket("Sáb", 70, 4, 280),
  ],
  hours: Array.from({ length: 24 }, (_, hour) =>
    createActivityBucket(
      `${hour}h`,
      [28, 56, 74, 80, 82, 84, 88, 96, 92, 89, 87, 88, 89, 88, 89, 87, 84, 78, 52, 30, 16, 10, 8, 12][hour],
      4,
      [112, 224, 296, 320, 328, 336, 352, 384, 368, 356, 348, 352, 356, 352, 356, 348, 336, 312, 208, 120, 64, 40, 32, 48][hour],
      hour === 7,
    ),
  ),
  effectiveSince: "2026-03-03",
  effectiveUntil: "2026-04-01",
  limitedToLast30Days: false,
};

export const metaPagesResponse = {
  data: [
    {
      id: "page-1",
      name: "Hazel Studio",
      instagram_business_account: {
        id: "ig-1",
        name: "Hazel Studio",
        username: "hazelstudio",
        profile_picture_url: "https://images.example.com/hazel.jpg",
        followers_count: 12500,
      },
    },
    {
      id: "page-2",
      name: "No Instagram Page",
    },
  ],
};

export const metaTotalInsightsResponse = {
  data: [
    { name: "accounts_engaged", total_value: { value: 3200 } },
    { name: "total_interactions", total_value: { value: 940 } },
    { name: "profile_links_taps", total_value: { value: 88 } },
    { name: "views", total_value: { value: 18200 } },
  ],
};

export const metaFollowersCountResponse = {
  followers_count: 3979,
};

export const metaFollowerCountSeriesResponse = {
  data: [
    {
      name: "follower_count",
      values: [
        { value: 30, end_time: "2026-03-30T00:00:00+0000" },
        { value: 40, end_time: "2026-03-31T00:00:00+0000" },
        { value: 50, end_time: "2026-04-01T00:00:00+0000" },
      ],
    },
  ],
};

export const metaProfileViewsSeriesResponse = {
  data: [
    {
      name: "profile_views",
      values: [
        { value: 6000, end_time: "2026-03-30T00:00:00+0000" },
        { value: 5900, end_time: "2026-03-31T00:00:00+0000" },
        { value: 6300, end_time: "2026-04-01T00:00:00+0000" },
      ],
    },
  ],
};

export const metaProfileViewsTotalValueResponse = {
  data: [
    {
      name: "profile_views",
      total_value: { value: 18200 },
    },
  ],
};

export const metaOverviewReachTotalValueResponse = {
  data: [
    {
      name: "reach",
      total_value: { value: 9500 },
    },
  ],
};

export const metaOverviewReachBreakdownResponse = {
  data: [
    {
      name: "reach",
      total_value: {
        breakdowns: [
          {
            dimension_keys: ["media_product_type"],
            results: [
              { dimension_values: ["POST"], value: 1789 },
              { dimension_values: ["REEL"], value: 3444 },
              { dimension_values: ["STORY"], value: 4267 },
              { dimension_values: ["AD"], value: 70736 },
            ],
          },
        ],
      },
    },
  ],
};

export const metaProfileLinksTapsResponse = {
  data: [
    {
      name: "profile_links_taps",
      total_value: { value: 88 },
    },
  ],
};

export const metaReachSeriesResponse = {
  data: [
    {
      name: "reach",
      values: insightsFixture.reach,
    },
  ],
};

export const metaFollowsResponse = {
  data: [
    {
      name: "follows_and_unfollows",
      total_value: {
        breakdowns: [
          {
            results: [
              { dimension_values: ["follow"], value: 120 },
              { dimension_values: ["unfollow"], value: 20 },
            ],
          },
        ],
      },
    },
  ],
};

export const metaFollowersGenderResponse = {
  data: [
    {
      name: "follower_demographics",
      total_value: {
        breakdowns: [
          {
            results: [
              { dimension_values: ["M"], value: 40 },
              { dimension_values: ["F"], value: 54 },
              { dimension_values: ["U"], value: 6 },
            ],
          },
        ],
      },
    },
  ],
};

export const metaFollowersCityResponse = {
  data: [
    {
      name: "follower_demographics",
      total_value: {
        breakdowns: [
          {
            results: [
              { dimension_values: ["São Paulo"], value: 3200 },
              { dimension_values: ["Rio de Janeiro"], value: 1800 },
            ],
          },
        ],
      },
    },
  ],
};

export const metaReachedAgeResponse = {
  data: [
    {
      name: "reached_audience_demographics",
      total_value: {
        breakdowns: [
          {
            results: [
              { dimension_values: ["18-24"], value: { M: 320, F: 410, U: 0 } },
              { dimension_values: ["25-34"], value: { M: 510, F: 680, U: 12 } },
            ],
          },
        ],
      },
    },
  ],
};

export const metaPostInsightsResponse = {
  data: [
    { name: "reach", total_value: { value: 2500 } },
    { name: "likes", total_value: { value: 240 } },
    { name: "comments", total_value: { value: 18 } },
    { name: "saved", total_value: { value: 34 } },
    { name: "shares", total_value: { value: 21 } },
    { name: "follows", total_value: { value: 12 } },
    { name: "total_interactions", total_value: { value: 313 } },
  ],
};

export const metaReelInsightsResponse = {
  data: [
    { name: "views", total_value: { value: 12000 } },
    { name: "reach", total_value: { value: 6500 } },
    { name: "likes", total_value: { value: 390 } },
    { name: "comments", total_value: { value: 44 } },
    { name: "saved", total_value: { value: 65 } },
    { name: "shares", total_value: { value: 51 } },
    { name: "total_interactions", total_value: { value: 550 } },
  ],
};

export const metaMediaResponse = {
  data: [
    {
      id: "post-1",
      caption: "Campanha lançamento",
      media_type: "IMAGE",
      media_url: "https://images.example.com/post-1.jpg",
      timestamp: "2026-04-01T10:00:00.000Z",
    },
    {
      id: "reel-1",
      caption: "Reel de tendência",
      media_type: "VIDEO",
      thumbnail_url: "https://images.example.com/reel-1.jpg",
      timestamp: "2026-03-30T09:00:00.000Z",
    },
  ],
};

export const metaStoriesEdgeResponse = {
  data: [
    {
      id: "story-1",
      caption: "Story 1",
      media_type: "STORY",
      media_product_type: "STORY",
      timestamp: "2026-04-08T10:00:00.000Z",
    },
    {
      id: "story-2",
      caption: "Story 2",
      media_type: "STORY",
      media_product_type: "STORY",
      timestamp: "2026-04-08T12:00:00.000Z",
    },
  ],
};

export const metaStoryInsightsResponse = {
  data: [
    { name: "reach", total_value: { value: 620 } },
    { name: "views", total_value: { value: 1790 } },
    { name: "replies", total_value: { value: 9 } },
  ],
};

export const metaStoryNavigationResponse = {
  data: [
    {
      name: "navigation",
      total_value: {
        value: {
          TAP_FORWARD: 260,
          TAP_BACK: 48.5,
          TAP_EXIT: 23,
          SWIPE_FORWARD: 5,
        },
      },
    },
  ],
};

export const metaStoryNavigationBreakdownResponse = {
  data: [
    {
      name: "navigation",
      total_value: {
        breakdowns: [
          {
            dimension_keys: ["story_navigation_action_type"],
            results: [
              { dimension_values: ["TAP_FORWARD"], value: 260 },
              { dimension_values: ["TAP_BACK"], value: 48.5 },
              { dimension_values: ["TAP_EXIT"], value: 23 },
              { dimension_values: ["SWIPE_FORWARD"], value: 5 },
            ],
          },
        ],
      },
    },
  ],
};

export const metaStoryNotEnoughViewersErrorPayload = {
  error: {
    message: "(#10) Not enough viewers for this media to show insights",
  },
};

export const metaStoryNavigationValuesResponse = {
  data: [
    {
      name: "navigation",
      values: [
        {
          value: {
            TAP_FORWARD: 260,
            TAP_BACK: 48.5,
            TAP_EXIT: 23,
            SWIPE_FORWARD: 5,
          },
        },
      ],
    },
  ],
};

export const metaApiErrorPayload = {
  error: {
    message: "Token expirado",
  },
};

export const metaOnlineFollowersResponse = {
  data: [
    {
      name: "online_followers",
      period: "lifetime",
      values: [
        { value: 80, end_time: "2026-03-30T03:00:00+0000" },
        { value: 96, end_time: "2026-03-30T10:00:00+0000" },
        { value: 84, end_time: "2026-03-31T10:00:00+0000" },
        { value: 108, end_time: "2026-04-01T10:00:00+0000" },
      ],
    },
  ],
};

export const metaReelsViewsBreakdownResponse = {
  data: [
    {
      name: "views",
      total_value: {
        breakdowns: [
          {
            dimension_keys: ["media_product_type"],
            results: [
              { dimension_values: ["POST"], value: 11415 },
              { dimension_values: ["REEL"], value: 17295 },
            ],
          },
        ],
      },
    },
  ],
};

export const metaReelsReachBreakdownResponse = {
  data: [
    {
      name: "reach",
      total_value: {
        breakdowns: [
          {
            dimension_keys: ["media_product_type"],
            results: [
              { dimension_values: ["POST"], value: 1789 },
              { dimension_values: ["REEL"], value: 3444 },
            ],
          },
        ],
      },
    },
  ],
};

export const metaReelsInteractionsBreakdownResponse = {
  data: [
    {
      name: "total_interactions",
      total_value: {
        breakdowns: [
          {
            dimension_keys: ["media_product_type"],
            results: [
              { dimension_values: ["POST"], value: 315 },
              { dimension_values: ["REEL"], value: 500 },
            ],
          },
        ],
      },
    },
  ],
};
