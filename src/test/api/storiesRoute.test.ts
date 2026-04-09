import { NextRequest } from "next/server";
import { GET } from "@/app/api/instagram/stories/route";
import { storiesFixture } from "@/test/mocks/fixtures/meta";

const fetchStoriesMock = vi.fn();

vi.mock("@/lib/api/meta/instagram", () => ({
  fetchStories: (...args: unknown[]) => fetchStoriesMock(...args),
}));

describe("/api/instagram/stories route", () => {
  beforeEach(() => {
    fetchStoriesMock.mockReset();
  });

  it("returns 400 when accountId is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/stories");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("accountId");
  });

  it("returns 200 with story summary", async () => {
    fetchStoriesMock.mockResolvedValue(storiesFixture);

    const request = new NextRequest("http://localhost:3000/api/instagram/stories?accountId=ig-1");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.stories.stories_count).toBe(3);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchStoriesMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest("http://localhost:3000/api/instagram/stories?accountId=ig-1");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
