import {
  metaApiErrorPayload,
  metaFollowersCityResponse,
  metaFollowersCountResponse,
  metaFollowersGenderResponse,
  metaFollowerCountSeriesResponse,
  metaFollowsResponse,
  metaMediaResponse,
  metaOnlineFollowersResponse,
  metaPagesResponse,
  metaOverviewReachTotalValueResponse,
  metaPostInsightsResponse,
  metaProfileLinksTapsResponse,
  metaProfileViewsSeriesResponse,
  metaProfileViewsTotalValueResponse,
  metaReachedAgeResponse,
  metaOverviewReachBreakdownResponse,
  metaReachSeriesResponse,
  metaReelsInteractionsBreakdownResponse,
  metaReelsReachBreakdownResponse,
  metaReelsViewsBreakdownResponse,
  metaReelInsightsResponse,
  metaTotalInsightsResponse,
} from "@/test/mocks/fixtures/meta";
import {
  fetchAccountInsights,
  fetchDemographics,
  fetchFeedPosts,
  fetchInstagramAccounts,
  fetchOnlineFollowersActivity,
  fetchOverviewAggregate,
  fetchPostInsights,
  fetchReelsAggregate,
  fetchReelInsights,
  fetchReels,
} from "@/lib/api/meta/instagram";

const metaFetchMock = vi.fn();
const metaFetchAbsoluteMock = vi.fn();

vi.mock("@/lib/api/meta/client", () => ({
  metaFetch: (...args: unknown[]) => metaFetchMock(...args),
  metaFetchAbsolute: (...args: unknown[]) => metaFetchAbsoluteMock(...args),
}));

describe("instagram api layer", () => {
  beforeEach(() => {
    metaFetchMock.mockReset();
    metaFetchAbsoluteMock.mockReset();
  });

  it("filters only pages with instagram business account", async () => {
    metaFetchMock.mockResolvedValue(metaPagesResponse);

    const result = await fetchInstagramAccounts();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ig-1");
  });

  it("separates account insights by metric type", async () => {
    metaFetchMock
      .mockResolvedValueOnce(metaTotalInsightsResponse)
      .mockResolvedValueOnce(metaReachSeriesResponse)
      .mockResolvedValueOnce(metaFollowsResponse);

    const result = await fetchAccountInsights("ig-1", "2026-03-01", "2026-03-30");

    expect(result.total_interactions).toBe(940);
    expect(metaFetchMock).toHaveBeenNthCalledWith(
      1,
      "ig-1/insights",
      expect.objectContaining({
        params: expect.objectContaining({ metric_type: "total_value" }),
      }),
    );
    expect(metaFetchMock).toHaveBeenNthCalledWith(
      2,
      "ig-1/insights",
      expect.objectContaining({
        params: expect.objectContaining({ metric_type: "time_series" }),
      }),
    );
  });

  it("splits ranges longer than 30 days into multiple insight windows", async () => {
    metaFetchMock.mockImplementation((_endpoint: string, options?: { params?: Record<string, string> }) => {
      const metric = options?.params?.metric;

      if (metric === "reach") {
        return Promise.resolve(metaReachSeriesResponse);
      }

      if (metric === "follows_and_unfollows") {
        return Promise.resolve(metaFollowsResponse);
      }

      return Promise.resolve(metaTotalInsightsResponse);
    });

    const result = await fetchAccountInsights("ig-1", "2026-01-02", "2026-04-01");
    const reachCalls = metaFetchMock.mock.calls.filter(
      ([, options]) => options?.params?.metric === "reach",
    );

    expect(reachCalls).toHaveLength(3);
    expect(reachCalls[0][1].params).toMatchObject({ since: "2026-01-02", until: "2026-01-31" });
    expect(reachCalls[1][1].params).toMatchObject({ since: "2026-02-01", until: "2026-03-02" });
    expect(reachCalls[2][1].params).toMatchObject({ since: "2026-03-03", until: "2026-04-01" });
    expect(result.total_interactions).toBe(2820);
    expect(result.reach).toHaveLength(9);
  });

  it("uses only supported demographics timeframes", async () => {
    metaFetchMock
      .mockResolvedValueOnce(metaFollowersGenderResponse)
      .mockResolvedValueOnce(metaFollowersCityResponse)
      .mockResolvedValueOnce(metaReachedAgeResponse);

    await fetchDemographics("ig-1", "this_week");

    expect(metaFetchMock).toHaveBeenCalledWith(
      "ig-1/insights",
      expect.objectContaining({
        params: expect.objectContaining({ timeframe: "this_week" }),
      }),
    );
  });

  it("builds overview aggregate metrics from account-level insights", async () => {
    metaFetchMock
      .mockResolvedValueOnce(metaFollowersCountResponse)
      .mockResolvedValueOnce(metaFollowerCountSeriesResponse)
      .mockResolvedValueOnce(metaProfileViewsTotalValueResponse)
      .mockResolvedValueOnce(metaOverviewReachTotalValueResponse)
      .mockResolvedValueOnce(metaProfileLinksTapsResponse);

    const overview = await fetchOverviewAggregate("ig-1", "2026-03-30", "2026-04-01");

    expect(overview).toEqual({
      followers_count: 3979,
      new_followers: 120,
      profile_views: 18200,
      profile_reach: 9500,
      profile_links_taps: 88,
    });
    expect(metaFetchMock).toHaveBeenNthCalledWith(
      1,
      "ig-1",
      expect.objectContaining({
        params: expect.objectContaining({ fields: "followers_count" }),
      }),
    );
    expect(metaFetchMock).toHaveBeenNthCalledWith(
      3,
      "ig-1/insights",
      expect.objectContaining({
        params: expect.objectContaining({ metric: "profile_views", metric_type: "total_value" }),
      }),
    );
  });

  it("splits long ranges for overview aggregate insights", async () => {
    metaFetchMock.mockImplementation((endpoint: string, options?: { params?: Record<string, string> }) => {
      if (endpoint === "ig-1") {
        return Promise.resolve(metaFollowersCountResponse);
      }

      const metric = options?.params?.metric;

      if (metric === "follower_count") {
        return Promise.resolve(metaFollowerCountSeriesResponse);
      }

      if (metric === "profile_views") {
        return Promise.resolve(metaProfileViewsTotalValueResponse);
      }

      if (metric === "reach") {
        return Promise.resolve(metaOverviewReachTotalValueResponse);
      }

      return Promise.resolve(metaProfileLinksTapsResponse);
    });

    const overview = await fetchOverviewAggregate("ig-1", "2026-01-02", "2026-04-01");
    const followerCountCalls = metaFetchMock.mock.calls.filter(
      ([endpoint, options]) => endpoint === "ig-1/insights" && options?.params?.metric === "follower_count",
    );

    expect(followerCountCalls).toHaveLength(3);
    expect(followerCountCalls[0][1].params).toMatchObject({ since: "2026-01-02", until: "2026-01-31" });
    expect(followerCountCalls[1][1].params).toMatchObject({ since: "2026-02-01", until: "2026-03-02" });
    expect(followerCountCalls[2][1].params).toMatchObject({ since: "2026-03-03", until: "2026-04-01" });
    expect(overview).toEqual({
      followers_count: 3979,
      new_followers: 360,
      profile_views: 54600,
      profile_reach: 28500,
      profile_links_taps: 264,
    });
  });

  it("falls back to follows_and_unfollows when follower_count is unavailable for the previous window", async () => {
    metaFetchMock.mockImplementation((endpoint: string, options?: { params?: Record<string, string> }) => {
      if (endpoint === "ig-1") {
        return Promise.resolve(metaFollowersCountResponse);
      }

      const metric = options?.params?.metric;

      if (metric === "follower_count") {
        return Promise.reject(
          new Error(
            "(#100) (follower_count) metric only supports querying data for the last 30 days excluding the current day",
          ),
        );
      }

      if (metric === "follows_and_unfollows") {
        return Promise.resolve(metaFollowsResponse);
      }

      if (metric === "profile_views") {
        return Promise.resolve(metaProfileViewsTotalValueResponse);
      }

      if (metric === "reach") {
        return Promise.resolve(metaOverviewReachTotalValueResponse);
      }

      return Promise.resolve(metaProfileLinksTapsResponse);
    });

    const overview = await fetchOverviewAggregate("ig-1", "2026-02-02", "2026-03-03");

    expect(overview).toEqual({
      followers_count: 3979,
      new_followers: 120,
      profile_views: 18200,
      profile_reach: 9500,
      profile_links_taps: 88,
    });
    expect(metaFetchMock).toHaveBeenCalledWith(
      "ig-1/insights",
      expect.objectContaining({
        params: expect.objectContaining({
          metric: "follows_and_unfollows",
          breakdown: "follow_type",
          metric_type: "total_value",
        }),
      }),
    );
  });

  it("separates feed posts from reels and normalizes insights", async () => {
    metaFetchMock
      .mockResolvedValueOnce(metaMediaResponse)
      .mockResolvedValueOnce(metaPostInsightsResponse)
      .mockResolvedValueOnce(metaMediaResponse)
      .mockResolvedValueOnce(metaReelInsightsResponse)
      .mockResolvedValueOnce(metaPostInsightsResponse)
      .mockResolvedValueOnce(metaReelInsightsResponse);

    const posts = await fetchFeedPosts("ig-1", "2026-03-01", "2026-03-30");
    const reels = await fetchReels("ig-1", "2026-03-01", "2026-03-30");
    const postInsights = await fetchPostInsights("post-1");
    const reelInsights = await fetchReelInsights("reel-1");

    expect(posts).toHaveLength(1);
    expect(reels).toHaveLength(1);
    expect(posts[0].media_type).not.toBe("VIDEO");
    expect(reels[0].insights.views).toBe(12000);
    expect(postInsights.total_interactions).toBe(313);
    expect(reelInsights.engagement_rate).toBeGreaterThan(0);
  });

  it("builds activity data from online followers", async () => {
    metaFetchMock.mockResolvedValue(metaOnlineFollowersResponse);

    const activity = await fetchOnlineFollowersActivity("ig-1", "2026-03-30", "2026-04-01");

    expect(activity.bestDay?.label).toBe("Qua");
    expect(activity.bestHour?.label).toBe("7h");
    expect(metaFetchMock).toHaveBeenCalledWith(
      "ig-1/insights",
      expect.objectContaining({
        params: expect.objectContaining({ metric: "online_followers", period: "lifetime" }),
      }),
    );
  });

  it("uses previous activity pages when the first page is incomplete", async () => {
    metaFetchMock.mockResolvedValue({
      ...metaOnlineFollowersResponse,
      data: [
        {
          name: "online_followers",
          period: "lifetime",
          values: [
            { value: {}, end_time: "2026-04-01T07:00:00+0000" },
            { value: {}, end_time: "2026-04-02T07:00:00+0000" },
          ],
        },
      ],
      paging: {
        previous: "https://graph.facebook.com/v25.0/ig-1/insights?page=prev",
      },
    });
    metaFetchAbsoluteMock.mockResolvedValue({
      data: [
        {
          name: "online_followers",
          period: "lifetime",
          values: [
            {
              value: { "0": 307, "7": 2095, "23": 232 },
              end_time: "2026-03-30T07:00:00+0000",
            },
            {
              value: { "0": 251, "7": 2109, "23": 237 },
              end_time: "2026-03-31T07:00:00+0000",
            },
          ],
        },
      ],
    });

    const activity = await fetchOnlineFollowersActivity("ig-1", "2026-03-30", "2026-04-02");

    expect(metaFetchAbsoluteMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v25.0/ig-1/insights?page=prev",
      expect.objectContaining({ revalidate: 1800 }),
    );
    expect(activity.bestHour?.label).toBe("7h");
    expect(activity.bestHour?.value).toBe(2102);
  });

  it("returns an empty activity state for known metric limitations", async () => {
    metaFetchMock.mockRejectedValue(new Error(metaApiErrorPayload.error.message + " for accounts under 100 followers"));

    const activity = await fetchOnlineFollowersActivity("ig-1", "2026-03-03", "2026-04-01");

    expect(activity.emptyReason).toContain("menos de 100 seguidores");
  });

  it("builds aggregated reel summary from account insights", async () => {
    metaFetchMock
      .mockResolvedValueOnce(metaReelsViewsBreakdownResponse)
      .mockResolvedValueOnce(metaReelsReachBreakdownResponse)
      .mockResolvedValueOnce(metaReelsInteractionsBreakdownResponse);

    const summary = await fetchReelsAggregate("ig-1", "2026-03-04", "2026-04-02");

    expect(summary).toEqual({
      views: 17295,
      reach: 3444,
      total_interactions: 500,
      engagement_rate: 14.52,
    });
  });

  it("splits long ranges for aggregated reel insights", async () => {
    metaFetchMock.mockImplementation((_endpoint: string, options?: { params?: Record<string, string> }) => {
      const metric = options?.params?.metric;

      if (metric === "views") {
        return Promise.resolve(metaReelsViewsBreakdownResponse);
      }

      if (metric === "reach") {
        return Promise.resolve(metaReelsReachBreakdownResponse);
      }

      return Promise.resolve(metaReelsInteractionsBreakdownResponse);
    });

    const summary = await fetchReelsAggregate("ig-1", "2026-01-02", "2026-04-01");
    const viewsCalls = metaFetchMock.mock.calls.filter(
      ([, options]) => options?.params?.metric === "views",
    );

    expect(viewsCalls).toHaveLength(3);
    expect(summary.views).toBe(51885);
    expect(summary.reach).toBe(10332);
    expect(summary.total_interactions).toBe(1500);
  });
});
