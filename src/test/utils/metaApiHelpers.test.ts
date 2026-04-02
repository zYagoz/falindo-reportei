import {
  metaReelsInteractionsBreakdownResponse,
  metaReelsReachBreakdownResponse,
  metaReelsViewsBreakdownResponse,
  metaFollowersCityResponse,
  metaFollowersGenderResponse,
  metaFollowsResponse,
  metaReachedAgeResponse,
  metaReachSeriesResponse,
  metaTotalInsightsResponse,
} from "@/test/mocks/fixtures/meta";
import {
  parseDemographicsResponse,
  parseFollowsAndUnfollows,
  parseFollowersCity,
  parseFollowersGender,
  parseInsightsResponse,
  parseMetricAggregateTotal,
  parseMetricBreakdownTotalValueExcluding,
  parseMetricTotalValue,
  parsePostInsights,
  parseReelInsights,
  parseReelsAggregate,
  parseReachedAge,
  parseReachTimeSeries,
} from "@/lib/utils/metaApiHelpers";
import {
  metaFollowerCountSeriesResponse,
  metaFollowersCountResponse,
  metaOverviewReachBreakdownResponse,
  metaOverviewReachTotalValueResponse,
  metaPostInsightsResponse,
  metaProfileLinksTapsResponse,
  metaProfileViewsSeriesResponse,
  metaReelInsightsResponse,
} from "@/test/mocks/fixtures/meta";
import { parseOverviewAggregate } from "@/lib/utils/metaApiHelpers";

describe("metaApiHelpers", () => {
  it("parses insight totals and reach time series", () => {
    const insights = parseInsightsResponse(
      metaTotalInsightsResponse,
      metaReachSeriesResponse,
      metaFollowsResponse,
    );

    expect(insights.accounts_engaged).toBe(3200);
    expect(insights.total_interactions).toBe(940);
    expect(parseReachTimeSeries(metaReachSeriesResponse)).toHaveLength(3);
  });

  it("parses follows and unfollows breakdown", () => {
    expect(parseFollowsAndUnfollows(metaFollowsResponse)).toEqual({
      follows: 120,
      unfollows: 20,
      net: 100,
    });
  });

  it("parses demographics by gender, city and age", () => {
    expect(parseFollowersGender(metaFollowersGenderResponse)).toEqual({ M: 40, F: 54, U: 6 });
    expect(parseFollowersCity(metaFollowersCityResponse)[0]).toEqual({
      city: "São Paulo",
      value: 3200,
    });
    expect(parseReachedAge(metaReachedAgeResponse)[0]).toEqual({
      range: "18-24",
      M: 320,
      F: 410,
      U: 0,
    });
    expect(
      parseDemographicsResponse(
        metaFollowersGenderResponse,
        metaFollowersCityResponse,
        metaReachedAgeResponse,
      ),
    ).toEqual(
      expect.objectContaining({
      followers_by_gender: { M: 40, F: 54, U: 6 },
      followers_by_city: expect.arrayContaining([{ city: "São Paulo", value: 3200 }]),
      }),
    );
  });

  it("returns safe fallbacks for missing data", () => {
    expect(parseFollowersGender({ data: [] })).toEqual({ M: 0, F: 0, U: 0 });
    expect(parseFollowersCity({ data: [] })).toEqual([]);
    expect(parseReachedAge({ data: [] })).toEqual([]);
    expect(parseFollowsAndUnfollows({ data: [] })).toEqual({ follows: 0, unfollows: 0, net: 0 });
  });

  it("parses aggregated reel metrics from media_product_type breakdown", () => {
    expect(
      parseReelsAggregate(
        metaReelsViewsBreakdownResponse,
        metaReelsReachBreakdownResponse,
        metaReelsInteractionsBreakdownResponse,
      ),
    ).toEqual({
      views: 17295,
      reach: 3444,
      total_interactions: 500,
      engagement_rate: 14.52,
    });
  });

  it("parses overview aggregate metrics and excludes ad buckets from reach", () => {
    expect(
      parseOverviewAggregate(
        metaFollowersCountResponse.followers_count,
        metaFollowerCountSeriesResponse,
        metaProfileViewsSeriesResponse,
        metaOverviewReachTotalValueResponse,
        metaProfileLinksTapsResponse,
      ),
    ).toEqual({
      followers_count: 3979,
      new_followers: 120,
      profile_views: 18200,
      profile_reach: 9500,
      profile_links_taps: 88,
    });
  });

  it("returns zero for missing overview metrics", () => {
    expect(
      parseOverviewAggregate(
        3979,
        { data: [] },
        { data: [] },
        {
          data: [
            {
              name: "reach",
              total_value: { value: 0 },
            },
          ],
        },
        { data: [] },
      ),
    ).toEqual({
      followers_count: 3979,
      new_followers: 0,
      profile_views: 0,
      profile_reach: 0,
      profile_links_taps: 0,
    });
  });

  it("reads metric totals from both total_value and series payloads", () => {
    expect(parseMetricTotalValue(metaTotalInsightsResponse, "views")).toBe(18200);
    expect(parseMetricTotalValue(metaProfileViewsSeriesResponse, "profile_views")).toBe(6300);
    expect(parseMetricAggregateTotal(metaProfileViewsSeriesResponse, "profile_views")).toBe(18200);
  });

  it("sums breakdown values while excluding ad dimensions", () => {
    expect(
      parseMetricBreakdownTotalValueExcluding(metaOverviewReachBreakdownResponse, "reach", [
        "AD",
        "DEFAULT_DO_NOT_USE",
      ]),
    ).toBe(9500);
  });

  it("parses post and reel insights payloads", () => {
    expect(parsePostInsights(metaPostInsightsResponse)).toEqual(
      expect.objectContaining({
        reach: 2500,
        likes: 240,
        follows: 12,
        total_interactions: 313,
      }),
    );
    expect(parseReelInsights(metaReelInsightsResponse)).toEqual(
      expect.objectContaining({
        views: 12000,
        shares: 51,
        total_interactions: 550,
      }),
    );
  });

  it("falls back to unknown labels when demographics breakdowns are partial", () => {
    expect(
      parseFollowersCity({
        data: [
          {
            name: "follower_demographics",
            total_value: { breakdowns: [{ results: [{ value: 22 }] }] },
          },
        ],
      }),
    ).toEqual([{ city: "Desconhecida", value: 22 }]);

    expect(
      parseReachedAge({
        data: [
          {
            name: "reached_audience_demographics",
            total_value: { breakdowns: [{ results: [{ value: 14 }] }] },
          },
        ],
      }),
    ).toEqual([{ range: "unknown", M: 0, F: 0, U: 14 }]);
  });

  it("throws a clear error for invalid structures", () => {
    expect(() => parseFollowersGender(null)).toThrow("Resposta da Meta API inválida para parsing.");
  });
});
