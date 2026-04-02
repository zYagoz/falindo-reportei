import { NextRequest } from "next/server";
import { GET } from "@/app/api/instagram/activity/route";
import { activityFixture } from "@/test/mocks/fixtures/meta";

const fetchOnlineFollowersActivityMock = vi.fn();

vi.mock("@/lib/api/meta/instagram", () => ({
  fetchOnlineFollowersActivity: (...args: unknown[]) => fetchOnlineFollowersActivityMock(...args),
}));

describe("/api/instagram/activity route", () => {
  beforeEach(() => {
    fetchOnlineFollowersActivityMock.mockReset();
  });

  it("returns 400 when required params are missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/activity");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("accountId");
  });

  it("returns 200 with activity", async () => {
    fetchOnlineFollowersActivityMock.mockResolvedValue(activityFixture);

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/activity?accountId=ig-1&since=2026-03-03&until=2026-04-01",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.activity.bestDay.label).toBe("Qua");
  });

  it("returns 500 when the api layer throws", async () => {
    fetchOnlineFollowersActivityMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/activity?accountId=ig-1&since=2026-03-03&until=2026-04-01",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
