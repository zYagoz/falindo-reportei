import { act, renderHook } from "@testing-library/react";
import { useDateRange } from "@/lib/hooks/useDateRange";

describe("useDateRange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with 30 day preset and recalculates active range", () => {
    const { result } = renderHook(() => useDateRange());

    expect(result.current.selectedPreset).toBe(1);
    expect(result.current.activeRange.label).toBe("Últimos 30 dias");
    expect(result.current.previousRange).toEqual({
      since: "2026-02-08",
      until: "2026-03-09",
      label: "Período anterior (30 dias)",
    });

    act(() => {
      result.current.setSelectedPreset(0);
    });

    expect(result.current.activeRange.label).toBe("Últimos 7 dias");
    expect(result.current.previousRange).toEqual({
      since: "2026-03-26",
      until: "2026-04-01",
      label: "Período anterior (7 dias)",
    });
  });

  it("supports a 90 day preset", () => {
    const { result } = renderHook(() => useDateRange());

    act(() => {
      result.current.setSelectedPreset(2);
    });

    expect(result.current.activeRange).toEqual({
      since: "2026-01-09",
      until: "2026-04-08",
      label: "Últimos 90 dias",
    });
    expect(result.current.previousRange).toEqual({
      since: "2025-10-11",
      until: "2026-01-08",
      label: "Período anterior (90 dias)",
    });
  });

  it("supports calendar month presets", () => {
    const { result } = renderHook(() => useDateRange());

    act(() => {
      result.current.setSelectedPreset(3);
    });

    expect(result.current.activeRange).toEqual({
      since: "2026-04-01",
      until: "2026-04-08",
      label: "Este mês",
    });
    expect(result.current.previousRange).toEqual({
      since: "2026-03-01",
      until: "2026-03-31",
      label: "Mês anterior",
    });

    act(() => {
      result.current.setSelectedPreset(4);
    });

    expect(result.current.activeRange).toEqual({
      since: "2026-03-01",
      until: "2026-03-31",
      label: "Mês anterior",
    });
    expect(result.current.previousRange).toEqual({
      since: "2026-02-01",
      until: "2026-02-28",
      label: "Mês anterior",
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
