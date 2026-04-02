import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useInstagramInsights } from "@/lib/hooks/useInstagramInsights";
import { server } from "@/test/mocks/server";

describe("useInstagramInsights", () => {
  const range = { since: "2026-03-03", until: "2026-04-01", label: "Últimos 30 dias" };

  it("does not fetch without accountId", () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const { result } = renderHook(() => useInstagramInsights(null, range));

    expect(result.current.loading).toBe(false);
    expect(result.current.insights).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("loads insights successfully and refetches on date change", async () => {
    let requests = 0;

    server.use(
      http.get("/api/instagram/insights", ({ request }) => {
        requests += 1;
        const url = new URL(request.url);
        const since = url.searchParams.get("since");

        return HttpResponse.json({
          insights: {
            accounts_engaged: since === "2026-03-24" ? 999 : 3200,
            total_interactions: 940,
            profile_links_taps: 88,
            views: 18200,
            follows_and_unfollows: {
              follows: 120,
              unfollows: 20,
              net: 100,
            },
            reach: [{ end_time: "2026-04-01T00:00:00+0000", value: 5300 }],
          },
        });
      }),
    );

    const { result, rerender } = renderHook(
      ({ accountId, dateRange }) => useInstagramInsights(accountId, dateRange),
      {
        initialProps: { accountId: "ig-1" as string | null, dateRange: range },
      },
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.insights?.accounts_engaged).toBe(3200);
    expect(requests).toBe(1);

    rerender({
      accountId: "ig-1",
      dateRange: { since: "2026-03-24", until: "2026-04-01", label: "Últimos 7 dias" },
    });

    await waitFor(() => expect(result.current.insights?.accounts_engaged).toBe(999));
    expect(requests).toBe(2);
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/instagram/insights", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useInstagramInsights("ig-1", range));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Falha interna");
  });
});
