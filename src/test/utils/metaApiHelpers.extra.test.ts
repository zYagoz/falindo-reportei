import {
  parseMetricAggregateTotal,
  parseMetricBreakdownTotalValue,
  parseMetricSeriesTotal,
  parseReachTimeSeries,
} from "@/lib/utils/metaApiHelpers";
import { metaReelsViewsBreakdownResponse } from "@/test/mocks/fixtures/meta";

describe("metaApiHelpers extra coverage", () => {
  it("reads direct breakdown totals for a single dimension", () => {
    expect(parseMetricBreakdownTotalValue(metaReelsViewsBreakdownResponse, "views", "REEL")).toBe(17295);
    expect(parseMetricBreakdownTotalValue(metaReelsViewsBreakdownResponse, "views", "STORY")).toBe(0);
  });

  it("sums series totals and aggregate fallbacks safely", () => {
    const seriesOnlyResponse = {
      data: [
        {
          name: "profile_views",
          values: [{ value: 12 }, { value: 15 }, { value: { organic: 3, paid: 5 } }],
        },
      ],
    };

    expect(parseMetricSeriesTotal(seriesOnlyResponse, "profile_views")).toBe(35);
    expect(parseMetricSeriesTotal({ data: [] }, "profile_views")).toBe(0);
    expect(parseMetricAggregateTotal({ data: [] }, "profile_views")).toBe(0);
    expect(parseMetricAggregateTotal({ data: [{ name: "profile_views", values: [] }] }, "profile_views")).toBe(0);
  });

  it("ignores invalid reach points and returns an empty series when absent", () => {
    expect(
      parseReachTimeSeries({
        data: [
          {
            name: "reach",
            values: [
              { value: 120, end_time: "2026-03-05T07:00:00+0000" },
              { value: Number.NaN, end_time: "2026-03-06T07:00:00+0000" },
              { value: 80 },
              { value: { total: 50 }, end_time: "2026-03-07T07:00:00+0000" },
            ],
          },
        ],
      }),
    ).toEqual([{ value: 120, end_time: "2026-03-05T07:00:00+0000" }]);

    expect(parseReachTimeSeries({ data: [] })).toEqual([]);
  });
});
