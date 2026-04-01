import {
  createCustomDateRange,
  DEFAULT_PRESET_INDEX,
  getDateRange,
  getDefaultDateRange,
  getPreviousDateRange,
} from "@/lib/utils/dateUtils";

describe("dateUtils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates 7, 30 and 90 day presets in YYYY-MM-DD format", () => {
    expect(getDateRange(7)).toEqual({
      since: "2026-03-26",
      until: "2026-04-01",
      label: "Últimos 7 dias",
    });
    expect(getDateRange(30).since).toBe("2026-03-03");
    expect(getDateRange(90).since).toBe("2026-01-02");
  });

  it("returns the default preset as 30 days", () => {
    expect(DEFAULT_PRESET_INDEX).toBe(1);
    expect(getDefaultDateRange()).toEqual({
      since: "2026-03-03",
      until: "2026-04-01",
      label: "Últimos 30 dias",
    });
  });

  it("creates custom ranges that override presets", () => {
    expect(createCustomDateRange("2026-02-01", "2026-02-10")).toEqual({
      since: "2026-02-01",
      until: "2026-02-10",
      label: "01/02/2026 - 10/02/2026",
    });
  });

  it("creates the previous comparison range with the same number of days", () => {
    expect(
      getPreviousDateRange({
        since: "2026-03-03",
        until: "2026-04-01",
        label: "Últimos 30 dias",
      }),
    ).toEqual({
      since: "2026-02-01",
      until: "2026-03-02",
      label: "Período anterior (30 dias)",
    });
  });
});
