import { buildInstagramActivity, parseOnlineFollowersSeries } from "@/lib/utils/metaApiHelpers";
import { metaOnlineFollowersResponse } from "@/test/mocks/fixtures/meta";

describe("activityInsights", () => {
  it("parses online followers series", () => {
    expect(parseOnlineFollowersSeries(metaOnlineFollowersResponse)).toHaveLength(4);
  });

  it("ignores online followers entries without numeric values", () => {
    expect(
      parseOnlineFollowersSeries({
        data: [
          {
            name: "online_followers",
            values: [
              { value: {}, end_time: "2026-04-01T07:00:00+0000" },
              { value: 120, end_time: "2026-04-01T08:00:00+0000" },
            ],
          },
        ],
      }),
    ).toEqual([{ value: 120, end_time: "2026-04-01T08:00:00+0000" }]);
  });

  it("aggregates values by day and hour in America/Sao_Paulo", () => {
    const activity = buildInstagramActivity(
      metaOnlineFollowersResponse.data[0].values,
      "2026-03-30",
      "2026-04-01",
      new Date("2026-04-01T12:00:00.000Z"),
    );

    expect(activity.bestDay?.label).toBe("Qua");
    expect(activity.bestHour?.label).toBe("7h");
    expect(activity.days).toHaveLength(7);
    expect(activity.hours).toHaveLength(24);
    expect(activity.days.find((bucket) => bucket.label === "Qua")?.value).toBe(108);
    expect(activity.hours.find((bucket) => bucket.label === "7h")?.value).toBe(96);
  });

  it("builds day and hour buckets from the real online_followers daily object shape", () => {
    const activity = buildInstagramActivity(
      parseOnlineFollowersSeries({
        data: [
          {
            name: "online_followers",
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
      }),
      "2026-03-30",
      "2026-03-31",
      new Date("2026-04-01T12:00:00.000Z"),
    );

    expect(activity.bestDay?.label).toBe("Seg");
    expect(activity.bestDay?.value).toBe(878);
    expect(activity.bestHour?.label).toBe("7h");
    expect(activity.bestHour?.value).toBe(2102);
  });

  it("limits oversized ranges to the last 30 days", () => {
    const activity = buildInstagramActivity(
      metaOnlineFollowersResponse.data[0].values,
      "2026-01-02",
      "2026-04-01",
      new Date("2026-04-01T12:00:00.000Z"),
    );

    expect(activity.limitedToLast30Days).toBe(true);
    expect(activity.effectiveSince).toBe("2026-03-03");
    expect(activity.effectiveUntil).toBe("2026-04-01");
  });

  it("returns an empty state when the metric is unavailable", () => {
    const activity = buildInstagramActivity([], "2026-03-03", "2026-04-01", new Date("2026-04-01T12:00:00.000Z"));

    expect(activity.bestDay).toBeNull();
    expect(activity.bestHour).toBeNull();
    expect(activity.emptyReason).toContain("não disponibilizou activity utilizável");
  });
});
