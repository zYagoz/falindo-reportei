import { expect, test } from "@playwright/test";
import {
  demographicsFixture,
  instagramAccountsFixture,
  insightsFixture,
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
  await page.route("**/api/instagram/demographics**", async (route) => {
    await route.fulfill({ json: { demographics: demographicsFixture } });
  });
  await page.route("**/api/instagram/posts**", async (route) => {
    await route.fulfill({ json: { posts: postsFixture } });
  });
  await page.route("**/api/instagram/reels**", async (route) => {
    await route.fulfill({ json: { reels: reelsFixture } });
  });
}

test("redirects to instagram and renders dashboard shell", async ({ page }) => {
  await mockDashboardApis(page);

  await page.goto("/");

  await expect(page).toHaveURL(/\/instagram$/);
  await expect(page.getByText("Social Insights Dashboard")).toBeVisible();
  await expect(page.getByText("Últimos 30 dias")).toBeVisible();
  await expect(page.getByText("Instagram")).toBeVisible();
});
