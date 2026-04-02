import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useInstagramDemographics } from "@/lib/hooks/useInstagramDemographics";
import { server } from "@/test/mocks/server";

describe("useInstagramDemographics", () => {
  it("does not fetch without accountId", () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const { result } = renderHook(() => useInstagramDemographics(null, "this_month"));

    expect(result.current.loading).toBe(false);
    expect(result.current.demographics).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("loads demographics successfully and refetches on timeframe change", async () => {
    let requests = 0;

    server.use(
      http.get("/api/instagram/demographics", ({ request }) => {
        requests += 1;
        const url = new URL(request.url);
        const timeframe = url.searchParams.get("timeframe");

        return HttpResponse.json({
          demographics: {
            followers_by_gender: timeframe === "this_week" ? { M: 20, F: 70, U: 10 } : { M: 40, F: 54, U: 6 },
            followers_by_city: [{ city: "São Paulo", value: 3200 }],
            reached_by_age: [{ range: "18-24", M: 320, F: 410, U: 0 }],
            engaged_by_age: [],
          },
        });
      }),
    );

    const { result, rerender } = renderHook(
      ({ accountId, timeframe }) => useInstagramDemographics(accountId, timeframe),
      {
        initialProps: { accountId: "ig-1" as string | null, timeframe: "this_month" as const },
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.demographics?.followers_by_gender.M).toBe(40);
    expect(requests).toBe(1);

    rerender({
      accountId: "ig-1",
      timeframe: "this_week" as const,
    });

    await waitFor(() => expect(result.current.demographics?.followers_by_gender.M).toBe(20));
    expect(requests).toBe(2);
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/instagram/demographics", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useInstagramDemographics("ig-1", "this_month"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Falha interna");
  });
});
