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
  storiesFixture,
} from "../src/test/mocks/fixtures/meta";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfPreviousMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0));
}

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
        overview: requestedSince === "2026-02-01" || requestedSince === "2026-03-01" ? previousOverviewFixture : overviewFixture,
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
  await page.route("**/api/instagram/stories**", async (route) => {
    await route.fulfill({ json: { stories: storiesFixture } });
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
  await expect(page.getByRole("button", { name: "Este mês", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mês anterior", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Instagram", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Stories", level: 3 })).toBeVisible();
  await expect(page.getByText("Stories ativas")).toBeVisible();
});

test("keeps activity visible for 90 days with a 30-day limitation notice", async ({ page }) => {
  await mockDashboardApis(page);
  const today = new Date();
  const expectedSince = formatDate(addDays(today, -89));
  const expectedUntil = formatDate(today);

  await page.goto("/instagram", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Stories ativas")).toBeVisible();
  await page.getByRole("button", { name: "Últimos 90 dias", exact: true }).click();

  await expect(page.getByLabel("Selecionar conta")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Melhor dia para postagens", level: 3 })).toBeVisible();
  await expect(page.locator('input[type="date"]').first()).toHaveValue(expectedSince);
  await expect(page.locator('input[type="date"]').nth(1)).toHaveValue(expectedUntil);
  await expect(page.getByText("A Meta disponibiliza activity apenas dos últimos 30 dias.")).toHaveCount(2);
});

test("supports calendar month presets", async ({ page }) => {
  await mockDashboardApis(page);
  const today = new Date();
  const currentMonthStart = formatDate(startOfMonth(today));
  const currentDay = formatDate(today);
  const previousMonthStart = formatDate(startOfMonth(endOfPreviousMonth(today)));
  const previousMonthEnd = formatDate(endOfPreviousMonth(today));

  await page.goto("/instagram", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Stories ativas")).toBeVisible();

  await page.getByRole("button", { name: "Este mês", exact: true }).click();
  await expect(page.locator('input[type="date"]').first()).toHaveValue(currentMonthStart);
  await expect(page.locator('input[type="date"]').nth(1)).toHaveValue(currentDay);

  await page.getByRole("button", { name: "Mês anterior", exact: true }).click();
  await expect(page.locator('input[type="date"]').first()).toHaveValue(previousMonthStart);
  await expect(page.locator('input[type="date"]').nth(1)).toHaveValue(previousMonthEnd);
});

test("stays stable on an intermediate desktop viewport", async ({ page }) => {
  await mockDashboardApis(page);
  await page.setViewportSize({ width: 1180, height: 960 });

  await page.goto("/instagram", { waitUntil: "domcontentloaded" });

  const accountSelect = page.locator('select[aria-label="Selecionar conta"]');
  const accountPreview = page.locator("p").filter({ hasText: "@hazelstudio" }).first();

  await expect(accountSelect).toBeVisible();
  await expect(accountPreview).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seguidores por gênero", level: 3 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Top cidades", level: 3 })).toBeVisible();

  const selectBox = await accountSelect.boundingBox();
  const previewBox = await accountPreview.boundingBox();
  expect(selectBox).not.toBeNull();
  expect(previewBox).not.toBeNull();
  expect(previewBox!.y).toBeGreaterThanOrEqual(selectBox!.y + 40);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
