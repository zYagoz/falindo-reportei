import { expect, test } from "@playwright/test";
import {
  activityFixture,
  demographicsFixture,
  instagramAccountsFixture,
  overviewFixture,
  reelsSummaryFixture,
  postsFixture,
  reelsFixture,
} from "../src/test/mocks/fixtures/meta";

test("shows section error without dropping the rest of the page", async ({ page }) => {
  await page.route("**/api/instagram/accounts", async (route) => {
    await route.fulfill({ json: { accounts: instagramAccountsFixture } });
  });
  await page.route("**/api/instagram/insights**", async (route) => {
    await route.fulfill({ status: 500, json: { error: "Erro na API de insights" } });
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

  await expect(page.getByText("Erro na API de insights")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Posts do feed", level: 2 })).toBeVisible();
});
