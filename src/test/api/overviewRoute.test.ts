import { NextRequest } from "next/server";
import { GET } from "@/app/api/instagram/overview/route";
import { overviewFixture } from "@/test/mocks/fixtures/meta";

const fetchOverviewAggregateMock = vi.fn();

vi.mock("@/lib/api/meta/instagram", () => ({
  fetchOverviewAggregate: (...args: unknown[]) => fetchOverviewAggregateMock(...args),
}));

describe("/api/instagram/overview route", () => {
  beforeEach(() => {
    fetchOverviewAggregateMock.mockReset();
  });

  it("returns 400 when required params are missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/overview");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("accountId");
  });

  it("returns 200 with overview", async () => {
    fetchOverviewAggregateMock.mockResolvedValue(overviewFixture);

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/overview?accountId=ig-1&since=2026-03-03&until=2026-04-01",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.overview).toEqual(overviewFixture);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchOverviewAggregateMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/overview?accountId=ig-1&since=2026-03-03&until=2026-04-01",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
