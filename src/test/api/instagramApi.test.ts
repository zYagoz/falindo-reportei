import {
  metaFollowersCityResponse,
  metaFollowersGenderResponse,
  metaFollowsResponse,
  metaMediaResponse,
  metaPagesResponse,
  metaPostInsightsResponse,
  metaReachedAgeResponse,
  metaReachSeriesResponse,
  metaReelInsightsResponse,
  metaTotalInsightsResponse,
} from "@/test/mocks/fixtures/meta";
import {
  fetchAccountInsights,
  fetchDemographics,
  fetchFeedPosts,
  fetchInstagramAccounts,
  fetchPostInsights,
  fetchReelInsights,
  fetchReels,
} from "@/lib/api/meta/instagram";

const metaFetchMock = vi.fn();

vi.mock("@/lib/api/meta/client", () => ({
  metaFetch: (...args: unknown[]) => metaFetchMock(...args),
}));

describe("instagram api layer", () => {
  beforeEach(() => {
    metaFetchMock.mockReset();
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
});
