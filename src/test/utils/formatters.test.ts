import {
  calculateEngagementRate,
  calculateVariation,
  formatNumber,
  formatPercent,
} from "@/lib/utils/formatters";

describe("formatters", () => {
  it("formats compact numbers", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1200)).toBe("1.2k");
    expect(formatNumber(1_250_000)).toBe("1.3M");
  });

  it("formats percent with signal", () => {
    expect(formatPercent(12.3456)).toBe("+12.35%");
    expect(formatPercent(-8.1)).toBe("-8.10%");
  });

  it("calculates engagement rate safely", () => {
    expect(calculateEngagementRate(0, 0)).toBe(0);
    expect(calculateEngagementRate(50, 1000)).toBe(5);
  });

  it("calculates variation safely", () => {
    expect(calculateVariation(120, 100)).toBe(20);
    expect(calculateVariation(100, 0)).toBe(0);
  });
});
