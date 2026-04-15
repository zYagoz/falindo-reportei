import { NextRequest } from "next/server";
import { GET } from "@/app/api/facebook/overview/route";
import { facebookOverviewFixture, facebookOverviewUnavailableFixture } from "@/test/mocks/fixtures/meta";

const fetchFacebookOverviewAggregateMock = vi.fn();

vi.mock("@/lib/api/meta/facebook", () => ({
  fetchFacebookOverviewAggregate: (...args: unknown[]) => fetchFacebookOverviewAggregateMock(...args),
}));

describe("/api/facebook/overview route", () => {
  beforeEach(() => {
    fetchFacebookOverviewAggregateMock.mockReset();
  });

  it("returns 400 when required params are missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/facebook/overview");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("pageId");
  });

  it("returns 200 with overview", async () => {
    fetchFacebookOverviewAggregateMock.mockResolvedValue(facebookOverviewFixture);

    const request = new NextRequest(
      "http://localhost:3000/api/facebook/overview?pageId=fb-page-1&since=2026-03-12&until=2026-04-10",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.overview).toEqual(facebookOverviewFixture);
  });

  it("returns 200 with an unavailable insights overview", async () => {
    fetchFacebookOverviewAggregateMock.mockResolvedValue(facebookOverviewUnavailableFixture);

    const request = new NextRequest(
      "http://localhost:3000/api/facebook/overview?pageId=fb-page-1&since=2026-03-12&until=2026-04-10",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.overview).toEqual(facebookOverviewUnavailableFixture);
    expect(payload.overview.insights_available).toBe(false);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchFacebookOverviewAggregateMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest(
      "http://localhost:3000/api/facebook/overview?pageId=fb-page-1&since=2026-03-12&until=2026-04-10",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
