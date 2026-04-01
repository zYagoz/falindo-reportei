import {
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
  parseReachedAge,
  parseReachTimeSeries,
} from "@/lib/utils/metaApiHelpers";

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
  });

  it("throws a clear error for invalid structures", () => {
    expect(() => parseFollowersGender(null)).toThrow("Resposta da Meta API inválida para parsing.");
  });
});
