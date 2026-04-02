import { expect, test } from "@playwright/test";
import {
  activityFixture,
  demographicsFixture,
  instagramAccountsFixture,
  insightsFixture,
  overviewFixture,
  previousOverviewFixture,
  reelsSummaryFixture,
  postsFixture,
  reelsFixture,
} from "../src/test/mocks/fixtures/meta";

async function mockDashboardApis(page: Parameters<typeof test>[0]["page"]) {
  await page.route("**/api/instagram/accounts", async (route) => {
    await route.fulfill({ json: { accounts: instagramAccountsFixture } });
  });
  await page.route("**/api/instagram/insights**", async (route) => {
    await route.fulfill({ json: { insights: insightsFixture } });
  });
  await page.route("**/api/instagram/overview**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const requestedSince = requestUrl.searchParams.get("since");

    await route.fulfill({
      json: {
        overview: requestedSince === "2026-02-01" ? previousOverviewFixture : overviewFixture,
      },
    });
  });
  await page.route("**/api/instagram/demographics**", async (route) => {
    await route.fulfill({ json: { demographics: demographicsFixture } });
  });
  await page.route("**/api/instagram/activity**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const requestedSince = requestUrl.searchParams.get("since");

    await route.fulfill({
      json: {
        activity:
          requestedSince && requestedSince < activityFixture.effectiveSince
            ? { ...activityFixture, limitedToLast30Days: true }
            : activityFixture,
      },
    });
  });
  await page.route("**/api/instagram/posts**", async (route) => {
    await route.fulfill({ json: { posts: postsFixture } });
  });
  await page.route("**/api/instagram/reels**", async (route) => {
    await route.fulfill({ json: { reels: reelsFixture } });
  });
  await page.route("**/api/instagram/reels-summary**", async (route) => {
    await route.fulfill({ json: { summary: reelsSummaryFixture } });
  });
}

test("redirects to instagram and renders dashboard shell", async ({ page }) => {
  await mockDashboardApis(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/instagram$/);
  await expect(page.getByLabel("Selecionar conta")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Social Insights Dashboard", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Últimos 30 dias", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Instagram", exact: true })).toBeVisible();
});

test("keeps activity visible for 90 days with a 30-day limitation notice", async ({ page }) => {
  await mockDashboardApis(page);

  await page.goto("/instagram", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Últimos 90 dias", exact: true }).click();

  await expect(page.getByLabel("Selecionar conta")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Melhor dia para postagens", level: 3 })).toBeVisible();
  await expect(page.getByText("A Meta disponibiliza activity apenas dos últimos 30 dias.")).toHaveCount(2);
});
