import { renderHook, act } from "@testing-library/react";
import { useDateRange } from "@/lib/hooks/useDateRange";

describe("useDateRange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with 30 day preset and recalculates active range", () => {
    const { result } = renderHook(() => useDateRange());

    expect(result.current.selectedPreset).toBe(1);
    expect(result.current.activeRange.label).toBe("Últimos 30 dias");
    expect(result.current.previousRange).toEqual({
      since: "2026-02-01",
      until: "2026-03-02",
      label: "Período anterior (30 dias)",
    });

    act(() => {
      result.current.setSelectedPreset(0);
    });

    expect(result.current.activeRange.label).toBe("Últimos 7 dias");
    expect(result.current.previousRange).toEqual({
      since: "2026-03-19",
      until: "2026-03-25",
      label: "Período anterior (7 dias)",
    });
  });

  it("accepts custom ranges", () => {
    const { result } = renderHook(() => useDateRange());

    act(() => {
      result.current.setCustomRange("2026-02-01", "2026-02-10");
    });

    expect(result.current.activeRange).toEqual({
      since: "2026-02-01",
      until: "2026-02-10",
      label: "01/02/2026 - 10/02/2026",
    });
    expect(result.current.previousRange).toEqual({
      since: "2026-01-22",
      until: "2026-01-31",
      label: "Período anterior (10 dias)",
    });
  });
});
