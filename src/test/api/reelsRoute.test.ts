import { NextRequest } from "next/server";
import { GET } from "@/app/api/instagram/reels/route";
import { reelsFixture } from "@/test/mocks/fixtures/meta";

const fetchReelsMock = vi.fn();

vi.mock("@/lib/api/meta/instagram", () => ({
  fetchReels: (...args: unknown[]) => fetchReelsMock(...args),
}));

describe("/api/instagram/reels route", () => {
  beforeEach(() => {
    fetchReelsMock.mockReset();
  });

  it("returns 400 when accountId is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/reels?since=2026-03-03&until=2026-04-01");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("accountId");
  });

  it("returns 400 when since is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/reels?accountId=ig-1&until=2026-04-01");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("since");
  });

  it("returns 400 when until is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/reels?accountId=ig-1&since=2026-03-03");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("until");
  });

  it("returns 200 with reels", async () => {
    fetchReelsMock.mockResolvedValue(reelsFixture);

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/reels?accountId=ig-1&since=2026-03-03&until=2026-04-01",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.reels).toEqual(reelsFixture);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchReelsMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/reels?accountId=ig-1&since=2026-03-03&until=2026-04-01",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
