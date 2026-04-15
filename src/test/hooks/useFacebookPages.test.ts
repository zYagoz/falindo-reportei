import { renderHook, waitFor } from "@testing-library/react";
import { useFacebookPages } from "@/lib/hooks/useFacebookPages";
import { facebookPagesFixture } from "@/test/mocks/fixtures/meta";

describe("useFacebookPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads pages successfully", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ pages: facebookPagesFixture }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { result } = renderHook(() => useFacebookPages());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pages).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("surfaces api errors", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Falha interna" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { result } = renderHook(() => useFacebookPages());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Falha interna");
  });
});
