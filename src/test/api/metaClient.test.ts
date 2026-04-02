import { metaApiErrorPayload } from "@/test/mocks/fixtures/meta";
import { metaFetch, metaFetchAbsolute } from "@/lib/api/meta/client";

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

  it("supports custom base url and api version", async () => {
    process.env.META_BASE_URL = "https://custom.meta.local";
    process.env.META_API_VERSION = "v25.0";

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await metaFetch("ig-1/insights", {
      params: { metric: "reach" },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://custom.meta.local/v25.0/ig-1/insights?access_token=token&metric=reach",
      { next: { revalidate: 3600 } },
    );
  });

  it("uses custom revalidate for absolute urls", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );

    await metaFetchAbsolute("https://graph.facebook.com/v25.0/ig-1/insights?page=prev", {
      revalidate: 1800,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v25.0/ig-1/insights?page=prev",
      { next: { revalidate: 1800 } },
    );
  });

  it("falls back to http status for absolute urls without a valid body", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

    await expect(
      metaFetchAbsolute("https://graph.facebook.com/v25.0/ig-1/insights?page=prev"),
    ).rejects.toThrow("Meta API Error: 500");
  });
});
