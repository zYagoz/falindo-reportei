import { NextRequest } from "next/server";
import { GET } from "@/app/api/instagram/demographics/route";
import { demographicsFixture } from "@/test/mocks/fixtures/meta";

const fetchDemographicsMock = vi.fn();

vi.mock("@/lib/api/meta/instagram", () => ({
  fetchDemographics: (...args: unknown[]) => fetchDemographicsMock(...args),
}));

describe("/api/instagram/demographics route", () => {
  beforeEach(() => {
    fetchDemographicsMock.mockReset();
  });

  it("returns 400 when accountId is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/demographics");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("accountId");
  });

  it("returns 400 when timeframe is invalid", async () => {
    const request = new NextRequest("http://localhost:3000/api/instagram/demographics?accountId=ig-1&timeframe=custom");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("timeframe");
  });

  it("returns 200 with demographics for this_month", async () => {
    fetchDemographicsMock.mockResolvedValue(demographicsFixture);

    const request = new NextRequest("http://localhost:3000/api/instagram/demographics?accountId=ig-1&timeframe=this_month");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.demographics).toEqual(demographicsFixture);
    expect(fetchDemographicsMock).toHaveBeenCalledWith("ig-1", "this_month");
  });

  it("returns 200 with demographics for this_week", async () => {
    fetchDemographicsMock.mockResolvedValue(demographicsFixture);

    const request = new NextRequest("http://localhost:3000/api/instagram/demographics?accountId=ig-1&timeframe=this_week");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.demographics).toEqual(demographicsFixture);
    expect(fetchDemographicsMock).toHaveBeenCalledWith("ig-1", "this_week");
  });

  it("returns 500 when the api layer throws", async () => {
    fetchDemographicsMock.mockRejectedValue(new Error("Falha Meta"));

    const request = new NextRequest("http://localhost:3000/api/instagram/demographics?accountId=ig-1&timeframe=this_month");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha Meta");
  });
});
