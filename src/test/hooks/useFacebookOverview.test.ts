import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useFacebookOverview } from "@/lib/hooks/useFacebookOverview";
import { server } from "@/test/mocks/server";

describe("useFacebookOverview", () => {
  const range = { since: "2026-03-12", until: "2026-04-10", label: "Ultimos 30 dias" };

  it("does not fetch without pageId", () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const { result } = renderHook(() => useFacebookOverview(null, range));

    expect(result.current.loading).toBe(false);
    expect(result.current.overview).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("loads overview successfully", async () => {
    const { result } = renderHook(() => useFacebookOverview("fb-page-1", range));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.overview?.followers_total).toBe(4821);
    expect(result.current.overview?.fan_count).toBe(534);
    expect(result.current.overview?.net_followers).toBe(32);
    expect(result.current.overview?.page_visits).toBe(1300);
    expect(result.current.overview?.insights_available).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/facebook/overview", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useFacebookOverview("fb-page-1", range));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Falha interna");
  });
});
