import { NextRequest } from "next/server";
import { GET } from "@/app/api/instagram/posts/route";
import { postsFixture } from "@/test/mocks/fixtures/meta";

const fetchFeedPostsMock = vi.fn();

vi.mock("@/lib/api/meta/instagram", () => ({
  fetchFeedPosts: (...args: unknown[]) => fetchFeedPostsMock(...args),
}));

describe("/api/instagram/posts route", () => {
  beforeEach(() => {
    fetchFeedPostsMock.mockReset();
  });

  it("returns 400 when accountId is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/posts?since=2026-03-03&until=2026-04-01");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("accountId");
  });

  it("returns 400 when since is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/posts?accountId=ig-1&until=2026-04-01");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("since");
  });

  it("returns 400 when until is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/posts?accountId=ig-1&since=2026-03-03");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("until");
  });

  it("returns 200 with posts", async () => {
    fetchFeedPostsMock.mockResolvedValue(postsFixture);

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/posts?accountId=ig-1&since=2026-03-03&until=2026-04-01",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.posts).toEqual(postsFixture);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchFeedPostsMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest(
      "http://localhost:3000/api/instagram/posts?accountId=ig-1&since=2026-03-03&until=2026-04-01",
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
