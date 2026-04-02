import { NextRequest } from "next/server";
import { GET } from "@/app/api/instagram/reels-summary/route";
import { reelsSummaryFixture } from "@/test/mocks/fixtures/meta";

const fetchReelsAggregateMock = vi.fn();

vi.mock("@/lib/api/meta/instagram", () => ({
  fetchReelsAggregate: (...args: unknown[]) => fetchReelsAggregateMock(...args),
}));

describe("/api/instagram/reels-summary route", () => {
  beforeEach(() => {
    fetchReelsAggregateMock.mockReset();
  });

  it("returns 400 when required params are missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/reels-summary");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("accountId");
  });

  it("returns 200 with summary", async () => {
    fetchReelsAggregateMock.mockResolvedValue(reelsSummaryFixture);

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/reels-summary?accountId=ig-1&since=2026-03-04&until=2026-04-02",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.summary.views).toBe(17295);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchReelsAggregateMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/reels-summary?accountId=ig-1&since=2026-03-04&until=2026-04-02",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
