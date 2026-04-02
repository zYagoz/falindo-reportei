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
} from "../src/test/mocks/fixtures/meta";

test("persists selected account in localStorage", async ({ page }) => {
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
  await page.route("**/api/instagram/reels**", async (route) => {
    await route.fulfill({ json: { reels: reelsFixture } });
  });
  await page.route("**/api/instagram/reels-summary**", async (route) => {
    await route.fulfill({ json: { summary: reelsSummaryFixture } });
  });

  await page.goto("/instagram", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Selecionar conta")).toBeVisible();
  await page.getByLabel("Selecionar conta").selectOption("ig-2");
  await expect(page.getByLabel("Selecionar conta")).toHaveValue("ig-2");

  await page.reload();
  await expect(page.getByLabel("Selecionar conta")).toHaveValue("ig-2");
});
