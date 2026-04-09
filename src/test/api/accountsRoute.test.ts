import { GET } from "@/app/api/instagram/accounts/route";
import { instagramAccountsFixture } from "@/test/mocks/fixtures/meta";

const fetchInstagramAccountsMock = vi.fn();

vi.mock("@/lib/api/meta/instagram", () => ({
  fetchInstagramAccounts: (...args: unknown[]) => fetchInstagramAccountsMock(...args),
}));

describe("/api/instagram/accounts route", () => {
  beforeEach(() => {
    fetchInstagramAccountsMock.mockReset();
  });

  it("returns 200 with accounts", async () => {
    fetchInstagramAccountsMock.mockResolvedValue(instagramAccountsFixture);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.accounts).toEqual(instagramAccountsFixture);
  });

  it("returns 500 when the api layer throws", async () => {
    fetchInstagramAccountsMock.mockRejectedValue(new Error("Falha Meta"));

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
