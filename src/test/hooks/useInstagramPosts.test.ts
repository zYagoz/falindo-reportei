import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useInstagramPosts } from "@/lib/hooks/useInstagramPosts";
import { server } from "@/test/mocks/server";

describe("useInstagramPosts", () => {
  const range = { since: "2026-03-03", until: "2026-04-01", label: "Últimos 30 dias" };

  it("does not fetch without accountId", () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    const { result } = renderHook(() => useInstagramPosts(null, range));

    expect(result.current.loading).toBe(false);
    expect(result.current.posts).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("loads posts successfully and refetches on date change", async () => {
    let requests = 0;

    server.use(
      http.get("/api/instagram/posts", ({ request }) => {
        requests += 1;
        const url = new URL(request.url);
        const since = url.searchParams.get("since");

        return HttpResponse.json({
          posts: [
            {
              id: `post-${since}`,
              caption: "Teste",
              media_type: "IMAGE",
              media_url: "https://images.example.com/post.jpg",
              timestamp: "2026-04-01T10:00:00.000Z",
              insights: {
                views: 0,
                reach: 2500,
                likes: 240,
                comments: 18,
                saved: 34,
                shares: 21,
                follows: 12,
                total_interactions: 313,
                engagement_rate: 12.52,
              },
            },
          ],
        });
      }),
    );

    const { result, rerender } = renderHook(
      ({ accountId, dateRange }) => useInstagramPosts(accountId, dateRange),
      {
        initialProps: { accountId: "ig-1" as string | null, dateRange: range },
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.posts[0]?.id).toBe("post-2026-03-03");
    expect(requests).toBe(1);

    rerender({
      accountId: "ig-1",
      dateRange: { since: "2026-03-24", until: "2026-04-01", label: "Últimos 7 dias" },
    });

    await waitFor(() => expect(result.current.posts[0]?.id).toBe("post-2026-03-24"));
    expect(requests).toBe(2);
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/instagram/posts", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useInstagramPosts("ig-1", range));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Falha interna");
  });
});
