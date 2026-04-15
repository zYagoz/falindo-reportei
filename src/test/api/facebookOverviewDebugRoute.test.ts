import { NextRequest } from "next/server";
import { GET } from "@/app/api/facebook/overview-debug/route";

const fetchFacebookOverviewDebugMock = vi.fn();

vi.mock("@/lib/api/meta/facebook", () => ({
  fetchFacebookOverviewDebug: (...args: unknown[]) => fetchFacebookOverviewDebugMock(...args),
}));

describe("/api/facebook/overview-debug route", () => {
  beforeEach(() => {
    fetchFacebookOverviewDebugMock.mockReset();
  });

  it("returns 400 when required params are missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/facebook/overview-debug");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("pageId");
  });

  it("returns 200 with debug payload", async () => {
    const debugFixture = {
      page: { id: "fb-page-1", name: "Minha Pagina" },
      period: { since: "2026-03-13", until: "2026-04-09", windows: [] },
      snapshot: { fields: "followers_count", raw: { followers_count: 198 } },
      overview_requests: [],
      chart_requests: [],
      parsed: {
        overview: {
          followers_total: 198,
          fan_count: 87,
          follows: 34,
          unfollows: 2,
          net_followers: 32,
          views: 128400,
          page_visits: 1300,
          content_interactions: 172,
          insights_available: true,
        },
        insights: {
          views: [],
        },
      },
    };

    fetchFacebookOverviewDebugMock.mockResolvedValue(debugFixture);

    const request = new NextRequest(
      "http://localhost:3000/api/facebook/overview-debug?pageId=fb-page-1&since=2026-03-13&until=2026-04-09",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.debug).toEqual(debugFixture);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchFacebookOverviewDebugMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest(
      "http://localhost:3000/api/facebook/overview-debug?pageId=fb-page-1&since=2026-03-13&until=2026-04-09",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
