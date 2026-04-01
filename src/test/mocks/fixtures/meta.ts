import type {
  DemographicData,
  InstagramAccount,
  InstagramInsights,
  InstagramPost,
  InstagramReel,
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

export const metaApiErrorPayload = {
  error: {
    message: "Token expirado",
  },
};
