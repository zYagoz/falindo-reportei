import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useInstagramActivity } from "@/lib/hooks/useInstagramActivity";
import { server } from "@/test/mocks/server";

describe("useInstagramActivity", () => {
  const range = { since: "2026-03-03", until: "2026-04-01", label: "Últimos 30 dias" };

  it("loads activity successfully", async () => {
    const { result } = renderHook(() => useInstagramActivity("ig-1", range));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.activity?.bestDay?.label).toBe("Qua");
    expect(result.current.error).toBeNull();
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/instagram/activity", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useInstagramActivity("ig-1", range));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Falha interna");
  });
});
