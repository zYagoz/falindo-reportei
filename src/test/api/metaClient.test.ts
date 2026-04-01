import { metaApiErrorPayload } from "@/test/mocks/fixtures/meta";
import { metaFetch } from "@/lib/api/meta/client";

describe("metaFetch", () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = "token";
    process.env.META_API_VERSION = "v21.0";
    process.env.META_BASE_URL = "https://graph.facebook.com";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds url with base version token and params", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await metaFetch("me/accounts", {
      params: { fields: "id,name" },
      revalidate: 60,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v21.0/me/accounts?access_token=token&fields=id%2Cname",
      { next: { revalidate: 60 } },
    );
  });

  it("uses default revalidate", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await metaFetch("me/accounts");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ next: { revalidate: 3600 } }),
    );
  });

  it("throws when token is missing", async () => {
    delete process.env.META_ACCESS_TOKEN;
    await expect(metaFetch("me/accounts")).rejects.toThrow("META_ACCESS_TOKEN não configurado");
  });

  it("propagates meta api errors and falls back to status", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(metaApiErrorPayload), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response("oops", { status: 429 }));

    await expect(metaFetch("me/accounts")).rejects.toThrow("Token expirado");
    await expect(metaFetch("me/accounts")).rejects.toThrow("Meta API Error: 429");
  });
});
