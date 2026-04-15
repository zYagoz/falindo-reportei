import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useFacebookInsights } from "@/lib/hooks/useFacebookInsights";
import { server } from "@/test/mocks/server";

describe("useFacebookInsights", () => {
  const range = { since: "2026-03-12", until: "2026-04-10", label: "Ultimos 30 dias" };

  it("does not fetch without pageId", () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const { result } = renderHook(() => useFacebookInsights(null, range));

    expect(result.current.loading).toBe(false);
    expect(result.current.insights).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("loads insights successfully and refetches on date change", async () => {
    let requests = 0;

    server.use(
      http.get("/api/facebook/insights", ({ request }) => {
        requests += 1;
        const url = new URL(request.url);
        const since = url.searchParams.get("since");

        return HttpResponse.json({
          insights: {
            views: [
              {
                end_time: "2026-04-01T00:00:00+0000",
                value: since === "2026-04-04" ? 9999 : 4210,
              },
            ],
          },
        });
      }),
    );

    const { result, rerender } = renderHook(
      ({ pageId, dateRange }) => useFacebookInsights(pageId, dateRange),
      {
        initialProps: { pageId: "fb-page-1" as string | null, dateRange: range },
      },
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.insights?.views[0]?.value).toBe(4210);
    expect(requests).toBe(1);

    rerender({
      pageId: "fb-page-1",
      dateRange: { since: "2026-04-04", until: "2026-04-10", label: "Ultimos 7 dias" },
    });

    await waitFor(() => expect(result.current.insights?.views[0]?.value).toBe(9999));
    expect(requests).toBe(2);
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/facebook/insights", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useFacebookInsights("fb-page-1", range));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Falha interna");
  });
});
