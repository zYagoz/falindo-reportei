import { GET } from "@/app/api/facebook/pages/route";
import { facebookPagesFixture } from "@/test/mocks/fixtures/meta";

const fetchFacebookPagesMock = vi.fn();

vi.mock("@/lib/api/meta/facebook", () => ({
  fetchFacebookPages: (...args: unknown[]) => fetchFacebookPagesMock(...args),
}));

describe("/api/facebook/pages route", () => {
  beforeEach(() => {
    fetchFacebookPagesMock.mockReset();
  });

  it("returns 200 with pages", async () => {
    fetchFacebookPagesMock.mockResolvedValue(facebookPagesFixture);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.pages).toEqual(facebookPagesFixture);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchFacebookPagesMock.mockRejectedValue(new Error("Falha Meta"));

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
