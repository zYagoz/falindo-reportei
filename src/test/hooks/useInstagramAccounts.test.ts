import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useInstagramAccounts } from "@/lib/hooks/useInstagramAccounts";
import { server } from "@/test/mocks/server";

describe("useInstagramAccounts", () => {
  it("loads accounts successfully", async () => {
    const { result } = renderHook(() => useInstagramAccounts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.accounts).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("surfaces api errors", async () => {
    server.use(
      http.get("/api/instagram/accounts", () =>
        HttpResponse.json({ error: "Falha interna" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useInstagramAccounts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Falha interna");
  });
});
