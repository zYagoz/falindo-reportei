import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useInstagramReels } from "@/lib/hooks/useInstagramReels";
import { server } from "@/test/mocks/server";

describe("useInstagramReels", () => {
  const range = { since: "2026-03-03", until: "2026-04-01", label: "Últimos 30 dias" };

  it("does not fetch without accountId", () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const { result } = renderHook(() => useInstagramReels(null, range));

    expect(result.current.loading).toBe(false);
    expect(result.current.reels).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("loads reels successfully and refetches on date change", async () => {
    let requests = 0;

    server.use(
      http.get("/api/instagram/reels", ({ request }) => {
        requests += 1;
        const url = new URL(request.url);
        const since = url.searchParams.get("since");

        return HttpResponse.json({
          reels: [
            {
              id: `reel-${since}`,
              caption: "Teste",
              thumbnail_url: "https://images.example.com/reel.jpg",
              timestamp: "2026-03-30T09:00:00.000Z",
              insights: {
                views: 12000,
                reach: 6500,
                likes: 390,
                comments: 44,
                saved: 65,
                shares: 51,
                total_interactions: 550,
                engagement_rate: 8.46,
              },
            },
          ],
        });
      }),
    );

    const { result, rerender } = renderHook(
      ({ accountId, dateRange }) => useInstagramReels(accountId, dateRange),
      {
        initialProps: { accountId: "ig-1" as string | null, dateRange: range },
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.reels[0]?.id).toBe("reel-2026-03-03");
    expect(requests).toBe(1);

    rerender({
      accountId: "ig-1",
      dateRange: { since: "2026-03-24", until: "2026-04-01", label: "Últimos 7 dias" },
    });

    await waitFor(() => expect(result.current.reels[0]?.id).toBe("reel-2026-03-24"));
    expect(requests).toBe(2);
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/instagram/reels", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useInstagramReels("ig-1", range));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Falha interna");
  });
});
