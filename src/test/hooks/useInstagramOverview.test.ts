import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useInstagramOverview } from "@/lib/hooks/useInstagramOverview";
import { server } from "@/test/mocks/server";

describe("useInstagramOverview", () => {
  const range = { since: "2026-03-03", until: "2026-04-01", label: "Últimos 30 dias" };

  it("loads overview successfully", async () => {
    const { result } = renderHook(() => useInstagramOverview("ig-1", range));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.overview?.followers_count).toBe(3979);
    expect(result.current.overview?.profile_links_taps).toBe(88);
    expect(result.current.error).toBeNull();
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/instagram/overview", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useInstagramOverview("ig-1", range));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Falha interna");
  });
});
