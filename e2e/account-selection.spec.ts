import { expect, test } from "@playwright/test";
import {
  activityFixture,
  demographicsFixture,
  instagramAccountsFixture,
  reelsSummaryFixture,
  insightsFixture,
  overviewFixture,
  postsFixture,
  reelsFixture,
  storiesFixture,
} from "../src/test/mocks/fixtures/meta";

test.setTimeout(60000);

test("persists selected account in localStorage", async ({ page }) => {
  const accountSelect = page.locator('select[aria-label="Selecionar conta"]');

  await page.route("**/api/instagram/accounts", async (route) => {
    await route.fulfill({ json: { accounts: instagramAccountsFixture } });
  });
  await page.route("**/api/instagram/insights**", async (route) => {
    await route.fulfill({ json: { insights: insightsFixture } });
  });
  await page.route("**/api/instagram/overview**", async (route) => {
    await route.fulfill({ json: { overview: overviewFixture } });
  });
  await page.route("**/api/instagram/demographics**", async (route) => {
    await route.fulfill({ json: { demographics: demographicsFixture } });
  });
  await page.route("**/api/instagram/activity**", async (route) => {
    await route.fulfill({ json: { activity: activityFixture } });
  });
  await page.route("**/api/instagram/posts**", async (route) => {
    await route.fulfill({ json: { posts: postsFixture } });
  });
  await page.route("**/api/instagram/stories**", async (route) => {
    await route.fulfill({ json: { stories: storiesFixture } });
  });
  await page.route("**/api/instagram/reels**", async (route) => {
    await route.fulfill({ json: { reels: reelsFixture } });
  });
  await page.route("**/api/instagram/reels-summary**", async (route) => {
    await route.fulfill({ json: { summary: reelsSummaryFixture } });
  });

  await page.goto("/instagram", { waitUntil: "domcontentloaded" });
  await expect(accountSelect).toBeVisible({ timeout: 15000 });
  await accountSelect.selectOption("ig-2");
  await expect(accountSelect).toHaveValue("ig-2");

  await page.reload();
  await expect(accountSelect).toBeVisible({ timeout: 15000 });
  await expect(accountSelect).toHaveValue("ig-2");
});
