import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useInstagramReelsSummary } from "@/lib/hooks/useInstagramReelsSummary";
import { server } from "@/test/mocks/server";

describe("useInstagramReelsSummary", () => {
  const range = { since: "2026-03-04", until: "2026-04-02", label: "Últimos 30 dias" };

  it("loads summary successfully", async () => {
    const { result } = renderHook(() => useInstagramReelsSummary("ig-1", range));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary?.views).toBe(17295);
    expect(result.current.error).toBeNull();
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/instagram/reels-summary", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useInstagramReelsSummary("ig-1", range));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Falha interna");
  });
});
