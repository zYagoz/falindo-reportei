import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useInstagramStories } from "@/lib/hooks/useInstagramStories";
import { server } from "@/test/mocks/server";

describe("useInstagramStories", () => {
  it("loads stories successfully", async () => {
    const { result } = renderHook(() => useInstagramStories("ig-1"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stories?.stories_count).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/instagram/stories", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useInstagramStories("ig-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Falha interna");
  });
});
