import { NextRequest } from "next/server";
import { GET } from "@/app/api/facebook/insights/route";
import { facebookInsightsFixture } from "@/test/mocks/fixtures/meta";

const fetchFacebookInsightsMock = vi.fn();

vi.mock("@/lib/api/meta/facebook", () => ({
  fetchFacebookInsights: (...args: unknown[]) => fetchFacebookInsightsMock(...args),
}));

describe("/api/facebook/insights route", () => {
  beforeEach(() => {
    fetchFacebookInsightsMock.mockReset();
  });

  it("returns 400 when required params are missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/facebook/insights");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("pageId");
  });

  it("returns 200 with insights", async () => {
    fetchFacebookInsightsMock.mockResolvedValue(facebookInsightsFixture);

    const request = new NextRequest(
      "http://localhost:3000/api/facebook/insights?pageId=fb-page-1&since=2026-03-12&until=2026-04-10",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.insights).toEqual(facebookInsightsFixture);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchFacebookInsightsMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest(
      "http://localhost:3000/api/facebook/insights?pageId=fb-page-1&since=2026-03-12&until=2026-04-10",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
